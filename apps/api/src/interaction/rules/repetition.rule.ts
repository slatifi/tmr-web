import { Injectable } from '@nestjs/common';
import { Context, Solver } from 'z3-solver';
import { EncodedData, InteractionRule, InteractionVariables } from '../interaction-rule.interface';
import { InteractionService } from '../interaction.service';

@Injectable()
export class RepetitionInteractionRule implements InteractionRule {
	readonly type = 'repetition';
	readonly entity = 'recommendation';

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;
		// Add constraint for repetition: same recommendation index but different guidelines
		const { guidelineIdFunc, strengthFunc, actionFunc } = data;

		const sameGuideline = z3.Eq(guidelineIdFunc.call(i1), guidelineIdFunc.call(i2));
		const differentRecs = z3.Not(z3.Eq(i1, i2));
		const i1Strength = z3.Eq(strengthFunc.call(i1), InteractionService.strengthMap.SHOULD);
		const i2Strength = z3.Eq(strengthFunc.call(i2), InteractionService.strengthMap.SHOULD);
		const sameAction = z3.Eq(actionFunc.call(i1), actionFunc.call(i2));

		solver.add(z3.And(sameGuideline, differentRecs, i1Strength, i2Strength, sameAction));
	}
}
