import { Contribution, Recommendation } from '@prisma/client';
import { Context, Solver } from 'z3-solver';

export interface InteractionVariables {
	[key: string]: ReturnType<Context['Int']['const']>;
}

export type Z3Function = ReturnType<Context['Function']['declare']>;

export interface EncodedData {
	guidelineIdFunc: Z3Function;
	strengthFunc: Z3Function;
	actionFunc: Z3Function;
	contribRecIdFunc: Z3Function;
	valueFunc: Z3Function;
	derivativeFunc: Z3Function;
	propertyFunc: Z3Function;
}

export interface InteractionRule {
	readonly type: string;
	readonly entity: 'recommendation' | 'contribution';

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData): void;
}

export type InteractingPair = [Recommendation, Recommendation] | [Contribution, Contribution];

export type InteractionResult = Record<string, InteractingPair[]>;
