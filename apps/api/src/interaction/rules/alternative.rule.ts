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
export class AlternativeInteractionRule implements InteractionRule {
	readonly type = 'alternative';
	readonly entity = 'contribution';
	readonly actionCheck: InteractionActionCheck[] = ['not-subsumes'];

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;
		// Add constraint for repetition: same recommendation index but different guidelines
		const { strengthFunc, contribRecIdFunc, propertyFunc, derivativeFunc, valueFunc } = data;

		const r1 = z3.Int.const('r1');
		const r2 = z3.Int.const('r2');
		const i1Rec = z3.Eq(contribRecIdFunc.call(i1), r1);
		const i2Rec = z3.Eq(contribRecIdFunc.call(i2), r2);
		const differentContribs = z3.Not(z3.Eq(i1, i2));

		// both recommendations should have SHOULD strength
		const r1Strength = z3.Eq(strengthFunc.call(r1), InteractionService.strengthMap.SHOULD);
		const r2Strength = z3.Eq(strengthFunc.call(r2), InteractionService.strengthMap.SHOULD);

		// both contributions should have positive or neutral value
		const i1Value = z3.Or(
			z3.Eq(valueFunc.call(i1), InteractionService.contributionValueMap.POSITIVE),
			z3.Eq(valueFunc.call(i1), InteractionService.contributionValueMap.NEUTRAL)
		);
		const i2Value = z3.Or(
			z3.Eq(valueFunc.call(i2), InteractionService.contributionValueMap.POSITIVE),
			z3.Eq(valueFunc.call(i2), InteractionService.contributionValueMap.NEUTRAL)
		);

		// contributions should have the same property
		const sameProperty = z3.Eq(propertyFunc.call(i1), propertyFunc.call(i2));

		// transition should have the same derivative
		const sameDerivative = z3.Eq(derivativeFunc.call(i1), derivativeFunc.call(i2));

		solver.add(
			z3.And(
				i1Rec,
				i2Rec,
				differentContribs,
				r1Strength,
				r2Strength,
				i1Value,
				i2Value,
				sameProperty,
				sameDerivative
			)
		);
	}
}
