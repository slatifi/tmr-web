import { Context, Solver } from 'z3-solver';

export type InteractionEntity = 'recommendation' | 'contribution';

export type InteractionVariable = ReturnType<Context['Int']['const']>;

export interface InteractionVariables {
	[key: string]: InteractionVariable;
}

export type Z3Function = ReturnType<Context['Function']['declare']>;

export interface EncodedData {
	recIdxMap: Map<number, number>;
	contribIdxMap: Map<number, number>;
	strengthFunc: Z3Function;
	contribRecIdFunc: Z3Function;
	valueFunc: Z3Function;
	derivativeFunc: Z3Function;
	propertyFunc: Z3Function;
}

export interface InteractionRule {
	readonly type: string;
	readonly entity: InteractionEntity;
	readonly actionCheck?: InteractionActionCheck[];

	define(z3: Context, solver: Solver, vars: InteractionVariables, data: EncodedData): void;
}

export interface InteractingPair {
	readonly entity: InteractionEntity;
	readonly id1: number;
	readonly id2: number;
}

export type InteractionResult = Record<string, InteractingPair[]>;

// For 2 codes A and B, the possible outcomes are:
// subsumed-by (or equivalent): A ⊆ B
// any: A ⊆ B or B ⊆ A
// not-subsumed: A does not ⊆ B
// not-subsumes: B does not ⊆ A
export type InteractionActionCheck = 'subsumed-by' | 'not-subsumed' | 'not-subsumes' | 'any';
