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
export class RepetitionInteractionRule implements InteractionRule {
	readonly type = 'repetition';
	readonly entity = 'recommendation';
	readonly actionCheck: InteractionActionCheck[] = ['subsumed-by'];

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData) {
		const { i1, i2 } = vars;
		// Add constraint for repetition: same recommendation index but different guidelines
		const { strengthFunc } = data;

		const differentRecs = z3.Not(z3.Eq(i1, i2));

		// both recommendations should have SHOULD strength
		const i1Strength = z3.Eq(strengthFunc.call(i1), InteractionService.strengthMap.SHOULD);
		const i2Strength = z3.Eq(strengthFunc.call(i2), InteractionService.strengthMap.SHOULD);

		solver.add(z3.And(differentRecs, i1Strength, i2Strength));
	}
}
