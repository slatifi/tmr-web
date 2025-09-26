import { Injectable } from '@nestjs/common';
import { Context, Solver } from 'z3-solver';
import {
	EncodedData,
	InteractionActionCheck,
	InteractionRule,
	InteractionVariables
} from '../interaction-rule.interface';
import { InteractionService } from '../interaction.service';

@Injectable()
export class DivergentInteractionRule implements InteractionRule {
	readonly type = 'divergent';
	readonly entity = 'contribution';
	readonly actionCheck: InteractionActionCheck[] = ['subsumed-by'];

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;

		const { strengthFunc, contribRecIdFunc, propertyFunc, derivativeFunc } = data;

		const r1 = z3.Int.const('r1');
		const r2 = z3.Int.const('r2');
		const i1Rec = z3.Eq(contribRecIdFunc.call(i1), r1);
		const i2Rec = z3.Eq(contribRecIdFunc.call(i2), r2);
		const sameRec = z3.Not(z3.Eq(r1, r2));
		const differentContribs = z3.Not(z3.Eq(i1, i2));

		// contributions should have the same property but different derivatives
		const sameProperty = z3.Eq(propertyFunc.call(i1), propertyFunc.call(i2));
		const differentDerivatives = z3.Not(z3.Eq(derivativeFunc.call(i1), derivativeFunc.call(i2)));

		// both recommendations should have SHOULD strength
		const r1Strength = z3.Eq(strengthFunc.call(r1), InteractionService.strengthMap.SHOULD);
		const r2Strength = z3.Eq(strengthFunc.call(r2), InteractionService.strengthMap.SHOULD);

		solver.add(
			z3.And(
				i1Rec,
				i2Rec,
				sameRec,
				differentContribs,
				sameProperty,
				differentDerivatives,
				r1Strength,
				r2Strength
			)
		);
	}
}
