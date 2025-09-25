import { Injectable } from '@nestjs/common';
import { Context, Solver } from 'z3-solver';
import { EncodedData, InteractionRule, InteractionVariables } from '../interaction-rule.interface';
import { InteractionService } from '../interaction.service';

@Injectable()
export class RecommendationContradictionInteractionRule implements InteractionRule {
	readonly type = 'recommendation_contradiction';
	readonly entity = 'recommendation';

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;
		// Add constraint for repetition: same recommendation index but different guidelines
		const { guidelineIdFunc, strengthFunc, actionFunc } = data;

		const sameGuideline = z3.Eq(guidelineIdFunc.call(i1), guidelineIdFunc.call(i2));
		const differentRecs = z3.Not(z3.Eq(i1, i2));

		// both recommendations should have the same action
		const sameAction = z3.Eq(actionFunc.call(i1), actionFunc.call(i2));
		const r1Strength = z3.Eq(strengthFunc.call(i1), InteractionService.strengthMap.SHOULD);
		const r2Strength = z3.Eq(strengthFunc.call(i2), InteractionService.strengthMap.NOT);

		solver.add(z3.And(sameGuideline, differentRecs, sameAction, r1Strength, r2Strength));
	}
}
