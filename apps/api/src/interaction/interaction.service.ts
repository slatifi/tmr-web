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
import {
	InteractingPair,
	InteractionActionCheck,
	InteractionResult,
	InteractionVariable,
	InteractionRule,
	EncodedData,
	InteractionVariables,
	InteractionEntity
} from './interaction-rule.interface';
import { RepetitionInteractionRule } from './rules/repetition.rule';
import { RecommendationContradictionInteractionRule } from './rules/recommendation_contradiction.rule';
import { ContributionContradictionInteractionRule } from './rules/contribution_contradiction.rule';
import { DivergentInteractionRule } from './rules/divergent.rule';
import { AlternativeInteractionRule } from './rules/alternative.rule';
import { RepairableInteractionRule } from './rules/repairable.rule';
import { SideEffectInteractionRule } from './rules/side_effect.rule';
import { SnomedService } from '@/snomed/snomed.service';
import { SNOMEDSubsumes } from '@/snomed/snomed.interface';

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
		private readonly snomedService: SnomedService,
		private readonly repetitionRule: RepetitionInteractionRule,
		private readonly recommendationContradictionRule: RecommendationContradictionInteractionRule,
		private readonly contributionContradictionRule: ContributionContradictionInteractionRule,
		private readonly divergentRule: DivergentInteractionRule,
		private readonly alternativeRule: AlternativeInteractionRule,
		private readonly repairableRule: RepairableInteractionRule,
		private readonly sideEffectRule: SideEffectInteractionRule
	) {
		this.initaliseRules();
	}

	private initaliseRules() {
		const rules = [
			this.repetitionRule,
			this.recommendationContradictionRule,
			this.contributionContradictionRule,
			this.divergentRule,
			this.alternativeRule,
			this.repairableRule,
			this.sideEffectRule
		];
		rules.forEach((r) => this.rules.set(r.type, r));
	}

	async findAll(guidelines: ExpandedGuideline[]): Promise<InteractionResult> {
		const recommendations = guidelines.flatMap((g) => g.recommendations);
		const contributions = recommendations.flatMap((r) => r.contributions);
		if (recommendations.length === 0) return {};

		const { Context, em } = await init();
		const z3 = Context('main');
		const solver = new z3.Solver();

		try {
			const encodedData: EncodedData = this.encodeData(z3, solver, recommendations, contributions);

			// Define integer variables for interacting indices
			const i1: InteractionVariable = z3.Int.const('i1');
			const i2: InteractionVariable = z3.Int.const('i2');

			return await this.processInteractionRules(
				z3,
				solver,
				{ i1, i2 },
				encodedData,
				recommendations,
				contributions
			);
		} finally {
			em.PThread.terminateAllThreads();
		}
	}

	private async processInteractionRules(
		z3: Context,
		solver: Solver,
		variables: InteractionVariables,
		encodedData: EncodedData,
		recommendations: RecommendationWithContributions[],
		contributions: ContributionWithTransition[]
	): Promise<InteractionResult> {
		const results: InteractionResult = {};

		for (const rule of this.rules.values()) {
			// Reset solver for each rule
			solver.push();

			try {
				this.addRulesConstraints(solver, variables, rule, recommendations, contributions);
				rule.define(z3, solver, variables, encodedData);

				const pairs = await this.findAllModels(
					z3,
					solver,
					variables.i1,
					variables.i2,
					rule.entity,
					rule.actionCheck,
					encodedData.recIdxMap,
					recommendations,
					encodedData.contribIdxMap,
					contributions
				);

				if (pairs.length > 0) {
					results[rule.type] = pairs;
				}
			} finally {
				solver.pop();
			}
		}
		return results;
	}

	private addRulesConstraints(
		solver: Solver,
		variables: InteractionVariables,
		rule: InteractionRule,
		recommendations: RecommendationWithContributions[],
		contributions: ContributionWithTransition[]
	) {
		const { i1, i2 } = variables;

		if (rule.entity === 'recommendation') {
			// Ensure indices refer to valid recommendations
			solver.add(i1.ge(0), i1.lt(recommendations.length));
			solver.add(i2.ge(0), i2.lt(recommendations.length));
		} else {
			// Ensure indices refer to valid contributions
			solver.add(i1.ge(0), i1.lt(contributions.length));
			solver.add(i2.ge(0), i2.lt(contributions.length));
		}
	}

	private encodeData(
		z3: Context,
		solver: Solver,
		recommendations: RecommendationWithContributions[],
		contributions: ContributionWithTransition[]
	): EncodedData {
		const mappings = this.createIndexMappings(recommendations, contributions);
		const functions = this.createZ3Functions(z3);

		this.addFunctionConstraints(z3, solver, recommendations, mappings, functions);

		return {
			...mappings,
			...functions
		};
	}

	private createIndexMappings(
		recommendations: RecommendationWithContributions[],
		contributions: ContributionWithTransition[]
	) {
		// map ids to indices to allow for length checks
		const recIdxMap = new Map<number, number>(recommendations.map((rec, idx) => [rec.id, idx]));

		const contribIdxMap = new Map<number, number>(
			contributions.map((contrib, idx) => [contrib.id, idx])
		);

		const uniqueProperties = [
			...new Set(
				contributions
					.map((contrib) => contrib.transition?.property)
					.filter((p): p is string => p !== undefined)
			)
		];
		const propertyMap = new Map<string, number>(uniqueProperties.map((prop, idx) => [prop, idx]));

		return { recIdxMap, contribIdxMap, propertyMap };
	}

	private createZ3Functions(z3: Context) {
		return {
			strengthFunc: z3.Function.declare('strength', z3.Int.sort(), z3.Int.sort()),
			contribRecIdFunc: z3.Function.declare('contribRecId', z3.Int.sort(), z3.Int.sort()),
			valueFunc: z3.Function.declare('value', z3.Int.sort(), z3.Int.sort()),
			derivativeFunc: z3.Function.declare('derivative', z3.Int.sort(), z3.Int.sort()),
			propertyFunc: z3.Function.declare('property', z3.Int.sort(), z3.Int.sort())
		};
	}

	private addFunctionConstraints(
		z3: Context,
		solver: Solver,
		recommendations: RecommendationWithContributions[],
		mappings: ReturnType<InteractionService['createIndexMappings']>,
		functions: ReturnType<InteractionService['createZ3Functions']>
	): void {
		const { recIdxMap, contribIdxMap, propertyMap } = mappings;

		recommendations.forEach((rec) => {
			const recIdx = recIdxMap.get(rec.id);
			if (recIdx === undefined) return;

			this.addRecommendationConstraints(z3, solver, rec, recIdx, functions);
			this.addContributionConstraints(
				z3,
				solver,
				rec.contributions,
				recIdxMap,
				contribIdxMap,
				propertyMap,
				functions
			);
		});
	}

	private addRecommendationConstraints(
		z3: Context,
		solver: Solver,
		recommendation: RecommendationWithContributions,
		recIdx: number,
		functions: ReturnType<InteractionService['createZ3Functions']>
	): void {
		const strength = InteractionService.strengthMap[recommendation.strength];

		// add strength constraints
		solver.add(z3.Eq(functions.strengthFunc.call(z3.Int.val(recIdx)), z3.Int.val(strength)));
	}

	private addContributionConstraints(
		z3: Context,
		solver: Solver,
		contributions: ContributionWithTransition[],
		recIdxMap: Map<number, number>,
		contribIdxMap: Map<number, number>,
		propertyMap: Map<string, number>,
		functions: ReturnType<InteractionService['createZ3Functions']>
	): void {
		contributions.forEach((contrib) => {
			// add idx and recommendation id constraints
			const contribIdx = contribIdxMap.get(contrib.id);
			const recIdx = recIdxMap.get(contrib.recommendationId);

			if (contribIdx === undefined || recIdx === undefined || !contrib.transition) {
				return;
			}

			const value = InteractionService.contributionValueMap[contrib.value];
			const derivative = InteractionService.derivativeMap[contrib.transition.derivative];
			const property = propertyMap.get(contrib.transition.property);

			if (value === undefined || derivative === undefined || property === undefined) {
				return;
			}

			solver.add(
				z3.Eq(functions.contribRecIdFunc.call(z3.Int.val(contribIdx)), z3.Int.val(recIdx))
			);
			solver.add(z3.Eq(functions.valueFunc.call(z3.Int.val(contribIdx)), z3.Int.val(value)));
			solver.add(
				z3.Eq(functions.derivativeFunc.call(z3.Int.val(contribIdx)), z3.Int.val(derivative))
			);
			solver.add(z3.Eq(functions.propertyFunc.call(z3.Int.val(contribIdx)), z3.Int.val(property)));
		});
	}

	private async findAllModels(
		z3: Context,
		solver: Solver,
		i1: InteractionVariable,
		i2: InteractionVariable,
		entity: InteractionEntity,
		actionChecks: InteractionActionCheck[] | undefined,
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
					// If action checks are defined, verify them
					if (actionChecks) {
						const actionA = recommendations.find((r) => r.id === contrib1.recommendationId)?.action;
						const actionB = recommendations.find((r) => r.id === contrib2.recommendationId)?.action;
						const valid = await this.handleActionCheck(actionChecks, actionA!, actionB!);
						if (valid) pairs.push({ entity: 'contribution', id1: contrib1.id, id2: contrib2.id });
					} else {
						pairs.push({ entity: 'contribution', id1: contrib1.id, id2: contrib2.id });
					}
				}
			} else {
				const rec1 = recommendations.find((r) => recIdxMap.get(r.id) === i1Val);
				const rec2 = recommendations.find((r) => recIdxMap.get(r.id) === i2Val);

				if (rec1 && rec2) {
					// If action checks are defined, verify them
					if (actionChecks) {
						const valid = await this.handleActionCheck(actionChecks, rec1.action, rec2.action);
						if (valid) pairs.push({ entity: 'recommendation', id1: rec1.id, id2: rec2.id });
					} else {
						pairs.push({ entity: 'recommendation', id1: rec1.id, id2: rec2.id });
					}
				}
			}

			// BLOCKING CLAUSE
			// Add constraint to block this model in the next iteration
			solver.add(z3.Not(z3.And(z3.Eq(i1, z3.Int.val(i1Val)), z3.Eq(i2, z3.Int.val(i2Val)))));
		}
		return pairs;
	}

	private async handleActionCheck(
		checks: InteractionActionCheck[],
		actionA: string,
		actionB: string
	): Promise<boolean> {
		if (!actionA || !actionB) return false;

		// Optimisation: if both not-subsumed and not-subsumes are required, we can do a single check for none
		if (checks.length === 2 && checks.includes('not-subsumed') && checks.includes('not-subsumes')) {
			const res = await this.snomedService.subsumes(actionA, actionB);
			return res === SNOMEDSubsumes.NONE;
		} else {
			for (const check of checks) {
				const res = await this.snomedService.subsumes(actionA, actionB);
				switch (check) {
					case 'subsumed-by':
						if (res !== SNOMEDSubsumes.EQUIVALENT && res !== SNOMEDSubsumes.SUMSUMED_BY)
							return false;
						break;
					case 'not-subsumed':
						if (res !== SNOMEDSubsumes.NONE && res !== SNOMEDSubsumes.SUBSUMES) return false;
						break;
					case 'not-subsumes':
						if (res !== SNOMEDSubsumes.NONE && res !== SNOMEDSubsumes.SUMSUMED_BY) return false;
						break;
					case 'any':
						if (res === SNOMEDSubsumes.NONE) return false;
				}
			}
		}
		return true;
	}
}
