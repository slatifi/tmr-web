import { Injectable } from '@nestjs/common';
import { Context, Solver } from 'z3-solver';
import { EncodedData, InteractionRule, InteractionVariables } from '../interaction-rule.interface';
import { InteractionService } from '../interaction.service';

@Injectable()
export class ContributionContradictionInteractionRule implements InteractionRule {
	readonly type = 'contribution_contradiction';
	readonly entity = 'contribution';

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;
		// Add constraint for repetition: same recommendation index but different guidelines
		const { strengthFunc, contribRecIdFunc, propertyFunc, derivativeFunc, valueFunc } = data;

		const r1 = z3.Int.const('r1');
		const r2 = z3.Int.const('r2');
		const i1Rec = z3.Eq(contribRecIdFunc.call(i1), r1);
		const i2Rec = z3.Eq(contribRecIdFunc.call(i2), r2);
		const differentContribs = z3.Not(z3.Eq(i1, i2));

		// r1 should have SHOULD strength and the contribution i1 should be positive or neutral
		const r1Strength = z3.Eq(strengthFunc.call(r1), InteractionService.strengthMap.SHOULD);
		const i1Value = z3.Or(
			z3.Eq(valueFunc.call(i1), InteractionService.contributionValueMap.POSITIVE),
			z3.Eq(valueFunc.call(i1), InteractionService.contributionValueMap.NEUTRAL)
		);

		// contributions should have the same property
		const sameProperty = z3.Eq(propertyFunc.call(i1), propertyFunc.call(i2));

		// if i2 has a different derivative than i1, it must be positive or neutral
		const differentDerivatives = z3.Not(z3.Eq(derivativeFunc.call(i1), derivativeFunc.call(i2)));
		const i2ValuePostitive = z3.Or(
			z3.Eq(valueFunc.call(i2), InteractionService.contributionValueMap.POSITIVE),
			z3.Eq(valueFunc.call(i2), InteractionService.contributionValueMap.NEUTRAL)
		);

		// if i2 has the same derivative as i1, it must be negative
		const sameDerivative = z3.Eq(derivativeFunc.call(i1), derivativeFunc.call(i2));
		const i2ValueNegative = z3.Eq(
			valueFunc.call(i2),
			InteractionService.contributionValueMap.NEGATIVE
		);

		// i2 value depends on whether the derivatives are the same or different
		const values = z3.Or(
			z3.And(sameDerivative, i2ValueNegative),
			z3.And(differentDerivatives, i2ValuePostitive)
		);

		solver.add(z3.And(i1Rec, i2Rec, differentContribs, sameProperty, r1Strength, i1Value, values));
	}
}
