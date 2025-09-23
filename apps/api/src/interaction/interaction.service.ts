import { Injectable } from '@nestjs/common';

import {
	ContributionValue,
	Derivative,
	Recommendation,
	RecommendationStrength
} from '@prisma/client';
import { ExpandedGuideline } from '@/cig/guideline/entities/expanded-guideline.entity';
import { RecommendationWithContributions } from '@/cig/recommendation/recommendation.interface';
import { ContributionWithTransition } from '@/cig/contribution/contribution.interface';

import { Context, Solver, init } from 'z3-solver';
import { InteractingPair, InteractionResult, InteractionRule } from './interaction-rule.interface';
import { RepetitionInteractionRule } from './rules/repetition.rule';
import { ContradictionInteractionRule } from './rules/contradiction.rule';

@Injectable()
export class InteractionService {
	private readonly rules = new Map<string, InteractionRule>();
	// Map enums to ints
	static strengthMap = { [RecommendationStrength.SHOULD]: 1, [RecommendationStrength.NOT]: 0 };
	static derivativeMap = {
		[Derivative.INCREASE]: 1,
		[Derivative.DECREASE]: -1,
		[Derivative.MAINTAIN]: 0
	};
	static contributionValueMap = {
		[ContributionValue.POSITIVE]: 1,
		[ContributionValue.NEGATIVE]: -1,
		[ContributionValue.NEUTRAL]: 0
	};

	constructor(
		private readonly repetitionRule: RepetitionInteractionRule,
		private readonly contradictionRule: ContradictionInteractionRule
	) {
		this.rules.set(this.repetitionRule.type, repetitionRule);
		this.rules.set(this.contradictionRule.type, contradictionRule);
	}

	async findAll(guidelines: ExpandedGuideline[]): Promise<InteractionResult> {
		const recommendations = guidelines.flatMap((g) => g.recommendations);
		const contributions = recommendations.flatMap((r) => r.contributions);
		if (recommendations.length === 0) return {};

		const { Context, em } = await init();
		const z3 = Context('main');
		const solver = new z3.Solver();

		const results: InteractionResult = {};

		try {
			const encodedData = this._encodeData(z3, solver, recommendations, contributions);

			// Define integer variables for interacting indices
			const i1 = z3.Int.const('i1');
			const i2 = z3.Int.const('i2');

			for (const rule of this.rules.values()) {
				// Reset solver for each rule
				solver.push();

				if (rule.entity === 'recommendation') {
					// Ensure indices refer to recommendations
					solver.add(i1.ge(0), i1.lt(recommendations.length));
					solver.add(i2.ge(0), i2.lt(recommendations.length));
				} else {
					solver.add(i1.ge(0), i1.lt(contributions.length));
					solver.add(i2.ge(0), i2.lt(contributions.length));
				}

				// Define rule constraints
				rule.define(z3, solver, { i1, i2 }, encodedData);

				// Find all models for the current rule
				const pairs = await this._findAllModels(
					z3,
					solver,
					i1,
					i2,
					rule.entity,
					encodedData.recIdxMap,
					recommendations,
					encodedData.contribIdxMap,
					contributions
				);
				if (pairs.length > 0) {
					results[rule.type] = pairs;
				}

				solver.pop();
			}
			return results;
		} finally {
			em.PThread.terminateAllThreads();
		}
	}

	private _encodeData(
		z3: Context,
		solver: Solver,
		recommendations: RecommendationWithContributions[],
		contributions: ContributionWithTransition[]
	) {
		// Map recommendation IDs to recommendation objects
		const recIdxMap = new Map<number, number>(recommendations.map((rec, idx) => [rec.id, idx]));
		const contribIdxMap = new Map<number, number>(
			contributions.map((contrib, idx) => [contrib.id, idx])
		);

		// Map SNOMED IDs to unique integers
		const uniqueActions = [...new Set(recommendations.map((rec) => rec.action))];
		const actionMap = new Map<string, number>(uniqueActions.map((action, idx) => [action, idx]));

		// Map property IDs to unique integers
		const uniqueProperties = [
			...new Set(
				contributions.map((contrib) => contrib.transition?.property).filter((p) => p !== undefined)
			)
		];
		const propertyMap = new Map<string, number>(uniqueProperties.map((prop, idx) => [prop, idx]));

		// Create Z3 functions
		const guidelineIdFunc = z3.Function.declare('guidelineId', z3.Int.sort(), z3.Int.sort());
		const strengthFunc = z3.Function.declare('strength', z3.Int.sort(), z3.Int.sort());
		const actionFunc = z3.Function.declare('action', z3.Int.sort(), z3.Int.sort());
		const contribRecIdFunc = z3.Function.declare('contribRecId', z3.Int.sort(), z3.Int.sort());
		const valueFunc = z3.Function.declare('value', z3.Int.sort(), z3.Int.sort());
		const derivativeFunc = z3.Function.declare('derivative', z3.Int.sort(), z3.Int.sort());
		const propertyFunc = z3.Function.declare('property', z3.Int.sort(), z3.Int.sort());

		// Add facts for functions
		for (const rec of recommendations) {
			const recIdx = recIdxMap.get(rec.id);
			if (recIdx === undefined) continue;

			const guidelineId = rec.guidelineId;
			const strength = InteractionService.strengthMap[rec.strength];
			const action = actionMap.get(rec.action);
			if (action === undefined) continue;

			solver.add(z3.Eq(guidelineIdFunc.call(z3.Int.val(recIdx)), z3.Int.val(guidelineId)));
			solver.add(z3.Eq(strengthFunc.call(z3.Int.val(recIdx)), z3.Int.val(strength)));
			solver.add(z3.Eq(actionFunc.call(z3.Int.val(recIdx)), z3.Int.val(action)));

			for (const contrib of rec.contributions) {
				const contribIdx = contribIdxMap.get(contrib.id);
				if (contribIdx === undefined) continue;

				const recIdx = recIdxMap.get(contrib.recommendationId);
				const value = InteractionService.contributionValueMap[contrib.value];
				if (recIdx === undefined || value === undefined) continue;

				if (!contrib.transition) continue;

				const derivative = InteractionService.derivativeMap[contrib.transition.derivative];
				const property = propertyMap.get(contrib.transition.property);
				if (derivative === undefined || property === undefined) continue;

				solver.add(z3.Eq(contribRecIdFunc.call(z3.Int.val(contribIdx)), z3.Int.val(recIdx)));
				solver.add(z3.Eq(valueFunc.call(z3.Int.val(contribIdx)), z3.Int.val(value)));
				solver.add(z3.Eq(derivativeFunc.call(z3.Int.val(contribIdx)), z3.Int.val(derivative)));
				solver.add(z3.Eq(propertyFunc.call(z3.Int.val(contribIdx)), z3.Int.val(property)));
			}
		}
		return {
			recIdxMap,
			contribIdxMap,
			actionMap,
			propertyMap,
			guidelineIdFunc,
			strengthFunc,
			actionFunc,
			contribRecIdFunc,
			valueFunc,
			derivativeFunc,
			propertyFunc
		};
	}

	private async _findAllModels(
		z3: Context,
		solver: Solver,
		i1: ReturnType<Context['Int']['const']>,
		i2: ReturnType<Context['Int']['const']>,
		entity: 'recommendation' | 'contribution',
		recIdxMap: Map<number, number>,
		recommendations: Recommendation[],
		contribIdxMap: Map<number, number>,
		contributions: ContributionWithTransition[]
	): Promise<InteractingPair[]> {
		const pairs: InteractingPair[] = [];

		while ((await solver.check()) === 'sat') {
			const model = solver.model();
			if (!model) break;

			const i1Val = Number(model.get(i1).toString());
			const i2Val = Number(model.get(i2).toString());

			if (entity === 'contribution') {
				const contrib1 = contributions.find((c) => contribIdxMap.get(c.id) === i1Val);
				const contrib2 = contributions.find((c) => contribIdxMap.get(c.id) === i2Val);

				if (contrib1 && contrib2) {
					pairs.push([contrib1, contrib2]);
				}
			} else {
				const rec1 = recommendations.find((r) => recIdxMap.get(r.id) === i1Val);
				const rec2 = recommendations.find((r) => recIdxMap.get(r.id) === i2Val);

				if (rec1 && rec2) {
					pairs.push([rec1, rec2]);
				}
			}

			// Add constraint to block this model in the next iteration
			solver.add(z3.Not(z3.And(z3.Eq(i1, z3.Int.val(i1Val)), z3.Eq(i2, z3.Int.val(i2Val)))));
			solver.add(z3.Not(z3.And(z3.Eq(i1, z3.Int.val(i2Val)), z3.Eq(i2, z3.Int.val(i1Val)))));
		}
		return pairs;
	}
}
