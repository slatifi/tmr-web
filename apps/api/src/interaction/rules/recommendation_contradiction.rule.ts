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
export class RecommendationContradictionInteractionRule implements InteractionRule {
	readonly type = 'recommendation_contradiction';
	readonly entity = 'recommendation';
	readonly actionCheck: InteractionActionCheck[] = ['any'];

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;
		// Add constraint for repetition: same recommendation index but different guidelines
		const { strengthFunc } = data;

		const differentRecs = z3.Not(z3.Eq(i1, i2));

		// both recommendations should have the same strength
		const r1Strength = z3.Eq(strengthFunc.call(i1), InteractionService.strengthMap.SHOULD);
		const r2Strength = z3.Eq(strengthFunc.call(i2), InteractionService.strengthMap.NOT);

		solver.add(z3.And(differentRecs, r1Strength, r2Strength));
	}
}
