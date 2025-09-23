import { Injectable } from '@nestjs/common';
import { Context, Solver } from 'z3-solver';
import { EncodedData, InteractionRule, InteractionVariables } from '../interaction-rule.interface';
import { InteractionService } from '../interaction.service';

@Injectable()
export class ContradictionInteractionRule implements InteractionRule {
	readonly type = 'contradiction';
	readonly entity = 'contribution';

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;
		// Add constraint for repetition: same recommendation index but different guidelines
		const {
			guidelineIdFunc,
			strengthFunc,
			actionFunc,
			contribRecIdFunc,
			propertyFunc,
			derivativeFunc
		} = data;

		const r1 = z3.Int.const('r1');
		const r2 = z3.Int.const('r2');
		const i1Rec = z3.Eq(contribRecIdFunc.call(i1), r1);
		const i2Rec = z3.Eq(contribRecIdFunc.call(i2), r2);
		const sameRec = z3.Not(z3.Eq(r1, r2));
		const differentContribs = z3.Not(z3.Eq(i1, i2));
		const sameAction = z3.Eq(actionFunc.call(r1), actionFunc.call(r2));
		const sameProperty = z3.Eq(propertyFunc.call(i1), propertyFunc.call(i2));
		const differentDerivatives = z3.Not(z3.Eq(derivativeFunc.call(i1), derivativeFunc.call(i2)));
		const r1Strength = z3.Eq(strengthFunc.call(r1), InteractionService.strengthMap.SHOULD);
		const r2Strength = z3.Eq(strengthFunc.call(r2), InteractionService.strengthMap.SHOULD);
		const sameGuideline = z3.Eq(guidelineIdFunc.call(r1), guidelineIdFunc.call(r2));

		solver.add(
			z3.And(
				i1Rec,
				i2Rec,
				sameRec,
				differentContribs,
				sameAction,
				sameProperty,
				differentDerivatives,
				r1Strength,
				r2Strength,
				sameGuideline
			)
		);
	}
}
