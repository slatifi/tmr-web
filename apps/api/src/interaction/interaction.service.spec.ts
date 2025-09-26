/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { InteractionService } from './interaction.service';
import { SnomedService } from '@/snomed/snomed.service';
import { SNOMEDSubsumes } from '@/snomed/snomed.interface';
import { RepetitionInteractionRule } from './rules/repetition.rule';
import { RecommendationContradictionInteractionRule } from './rules/recommendation_contradiction.rule';
import { ContributionContradictionInteractionRule } from './rules/contribution_contradiction.rule';
import { DivergentInteractionRule } from './rules/divergent.rule';
import { AlternativeInteractionRule } from './rules/alternative.rule';
import { RepairableInteractionRule } from './rules/repairable.rule';
import { SideEffectInteractionRule } from './rules/side_effect.rule';
import { ExpandedGuideline } from '@/cig/guideline/entities/expanded-guideline.entity';
import { RecommendationStrength, ContributionValue, Derivative } from '@prisma/client';
import { RecommendationWithContributions } from '@/cig/recommendation/recommendation.interface';
import { ContributionWithTransition } from '@/cig/contribution/contribution.interface';
import { InteractionRule, InteractionEntity } from './interaction-rule.interface';

import { expandedGuidelineStub, guidelineStub } from 'test/fixtures/guideline.stub';
import { recommendationStub } from 'test/fixtures/recommendation.stub';
import { contributionStub } from 'test/fixtures/contribution.stub';

// Mock Z3 solver
jest.mock('z3-solver', () => ({
	init: jest.fn().mockResolvedValue({
		Context: jest.fn().mockReturnValue({
			Int: {
				const: jest.fn().mockReturnValue({
					ge: jest.fn().mockReturnValue({}),
					lt: jest.fn().mockReturnValue({})
				}),
				sort: jest.fn().mockReturnValue({}),
				val: jest.fn().mockReturnValue({})
			},
			Function: {
				declare: jest.fn().mockReturnValue({
					call: jest.fn().mockReturnValue({})
				})
			},
			Solver: jest.fn().mockReturnValue({
				add: jest.fn(),
				push: jest.fn(),
				pop: jest.fn(),
				check: jest.fn().mockResolvedValue('unsat'),
				model: jest.fn().mockReturnValue({
					get: jest.fn().mockReturnValue({ toString: () => '0' })
				})
			}),
			Eq: jest.fn().mockReturnValue({}),
			And: jest.fn().mockReturnValue({}),
			Not: jest.fn().mockReturnValue({})
		}),
		em: {
			PThread: {
				terminateAllThreads: jest.fn()
			}
		}
	})
}));

describe('InteractionService', () => {
	let service: InteractionService;
	let snomedService: jest.Mocked<SnomedService>;
	let mockRules: jest.Mocked<InteractionRule>[];

	const createMockRule = (
		type: string,
		entity: InteractionEntity
	): jest.Mocked<InteractionRule> => ({
		type,
		entity,
		actionCheck: undefined,
		define: jest.fn()
	});

	beforeEach(async () => {
		const mockSnomedService = {
			subsumes: jest.fn()
		};

		mockRules = [
			createMockRule('repetition', 'recommendation'),
			createMockRule('recommendation_contradiction', 'recommendation'),
			createMockRule('contribution_contradiction', 'contribution'),
			createMockRule('divergent', 'recommendation'),
			createMockRule('alternative', 'recommendation'),
			createMockRule('repairable', 'recommendation'),
			createMockRule('side_effect', 'contribution')
		];

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InteractionService,
				{ provide: SnomedService, useValue: mockSnomedService },
				{ provide: RepetitionInteractionRule, useValue: mockRules[0] },
				{ provide: RecommendationContradictionInteractionRule, useValue: mockRules[1] },
				{ provide: ContributionContradictionInteractionRule, useValue: mockRules[2] },
				{ provide: DivergentInteractionRule, useValue: mockRules[3] },
				{ provide: AlternativeInteractionRule, useValue: mockRules[4] },
				{ provide: RepairableInteractionRule, useValue: mockRules[5] },
				{ provide: SideEffectInteractionRule, useValue: mockRules[6] }
			]
		}).compile();

		service = module.get<InteractionService>(InteractionService);
		snomedService = module.get(SnomedService);
	});

	describe('initialisation', () => {
		it('should be defined', () => {
			expect(service).toBeDefined();
		});

		it('should initialise rules correctly', () => {
			expect(service['rules'].size).toBe(7);
			expect(service['rules'].has('repetition')).toBe(true);
			expect(service['rules'].has('recommendation_contradiction')).toBe(true);
			expect(service['rules'].has('contribution_contradiction')).toBe(true);
		});
	});

	describe('static mappings', () => {
		it('should have correct strength mapping', () => {
			expect(InteractionService.strengthMap[RecommendationStrength.SHOULD]).toBe(1);
			expect(InteractionService.strengthMap[RecommendationStrength.NOT]).toBe(0);
		});

		it('should have correct derivative mapping', () => {
			expect(InteractionService.derivativeMap[Derivative.INCREASE]).toBe(1);
			expect(InteractionService.derivativeMap[Derivative.DECREASE]).toBe(-1);
			expect(InteractionService.derivativeMap[Derivative.MAINTAIN]).toBe(0);
		});

		it('should have correct contribution value mapping', () => {
			expect(InteractionService.contributionValueMap[ContributionValue.POSITIVE]).toBe(1);
			expect(InteractionService.contributionValueMap[ContributionValue.NEGATIVE]).toBe(-1);
			expect(InteractionService.contributionValueMap[ContributionValue.NEUTRAL]).toBe(0);
		});
	});

	describe('findAll', () => {
		it('should return empty result for empty guidelines', async () => {
			const result = await service.findAll([]);
			expect(result).toEqual({});
		});

		it('should return empty result for guidelines with no recommendations', async () => {
			const guidelines: ExpandedGuideline[] = [
				{
					...guidelineStub,
					recommendations: []
				}
			];

			const result = await service.findAll(guidelines);
			expect(result).toEqual({});
		});

		it('should process guidelines with recommendations', async () => {
			const guidelines: ExpandedGuideline[] = [expandedGuidelineStub];

			const result = await service.findAll(guidelines);
			expect(result).toBeDefined();
			expect(typeof result).toBe('object');
		});
	});

	describe('handleActionCheck', () => {
		beforeEach(() => {
			snomedService.subsumes.mockClear();
		});

		it('should return false for missing actions', async () => {
			const result = await service['handleActionCheck'](['any'], '', 'action2');
			expect(result).toBe(false);

			const result2 = await service['handleActionCheck'](['any'], 'action1', '');
			expect(result2).toBe(false);
		});

		it('should handle optimised not-subsumed and not-subsumes check', async () => {
			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.NONE);

			const result = await service['handleActionCheck'](
				['not-subsumed', 'not-subsumes'],
				'action1',
				'action2'
			);

			expect(result).toBe(true);
			expect(snomedService.subsumes).toHaveBeenCalledTimes(1);
			expect(snomedService.subsumes).toHaveBeenCalledWith('action1', 'action2');
		});

		it('should handle subsumed-by check correctly', async () => {
			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.EQUIVALENT);

			const result = await service['handleActionCheck'](['subsumed-by'], 'action1', 'action2');
			expect(result).toBe(true);

			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.SUMSUMED_BY);
			const result2 = await service['handleActionCheck'](['subsumed-by'], 'action1', 'action2');
			expect(result2).toBe(true);

			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.NONE);
			const result3 = await service['handleActionCheck'](['subsumed-by'], 'action1', 'action2');
			expect(result3).toBe(false);
		});

		it('should handle not-subsumed check correctly', async () => {
			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.NONE);

			const result = await service['handleActionCheck'](['not-subsumed'], 'action1', 'action2');
			expect(result).toBe(true);

			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.SUBSUMES);
			const result2 = await service['handleActionCheck'](['not-subsumed'], 'action1', 'action2');
			expect(result2).toBe(true);

			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.EQUIVALENT);
			const result3 = await service['handleActionCheck'](['not-subsumed'], 'action1', 'action2');
			expect(result3).toBe(false);
		});

		it('should handle not-subsumes check correctly', async () => {
			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.NONE);

			const result = await service['handleActionCheck'](['not-subsumes'], 'action1', 'action2');
			expect(result).toBe(true);

			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.SUMSUMED_BY);
			const result2 = await service['handleActionCheck'](['not-subsumes'], 'action1', 'action2');
			expect(result2).toBe(true);

			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.SUBSUMES);
			const result3 = await service['handleActionCheck'](['not-subsumes'], 'action1', 'action2');
			expect(result3).toBe(false);
		});

		it('should handle any check correctly', async () => {
			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.EQUIVALENT);

			const result = await service['handleActionCheck'](['any'], 'action1', 'action2');
			expect(result).toBe(true);

			snomedService.subsumes.mockResolvedValue(SNOMEDSubsumes.NONE);
			const result2 = await service['handleActionCheck'](['any'], 'action1', 'action2');
			expect(result2).toBe(false);
		});
	});

	describe('encodeData', () => {
		it('should return encoded data with mappings and functions', () => {
			const mockZ3 = {
				Int: { sort: jest.fn().mockReturnValue({}), val: jest.fn().mockReturnValue({}) },
				Function: { declare: jest.fn().mockReturnValue({ call: jest.fn().mockReturnValue({}) }) },
				Eq: jest.fn().mockReturnValue({})
			} as any;

			const mockSolver = { add: jest.fn() } as any;
			const recommendations = [
				{
					...recommendationStub,
					contributions: []
				}
			] as RecommendationWithContributions[];
			const contributions = [
				{
					...contributionStub,
					transition: { derivative: Derivative.INCREASE, property: 'prop' }
				}
			] as ContributionWithTransition[];

			const result = (service as any).encodeData(
				mockZ3,
				mockSolver,
				recommendations,
				contributions
			);

			expect(result.recIdxMap).toBeDefined();
			expect(result.contribIdxMap).toBeDefined();
			expect(result.propertyMap).toBeDefined();
			expect(result.strengthFunc).toBeDefined();
		});
	});

	describe('createIndexMappings', () => {
		it('should create correct index mappings', () => {
			const recommendations: RecommendationWithContributions[] = [
				{ ...recommendationStub, id: 1, contributions: [] } as RecommendationWithContributions,
				{ ...recommendationStub, id: 2, contributions: [] } as RecommendationWithContributions,
				{ ...recommendationStub, id: 3, contributions: [] } as RecommendationWithContributions
			];

			const contributions: ContributionWithTransition[] = [
				{ id: 1, transition: { property: 'prop1' } } as ContributionWithTransition,
				{ id: 2, transition: { property: 'prop2' } } as ContributionWithTransition,
				{ id: 3, transition: { property: 'prop1' } } as ContributionWithTransition
			];

			const mappings = service['createIndexMappings'](recommendations, contributions);

			expect(mappings.recIdxMap.get(1)).toBe(0);
			expect(mappings.recIdxMap.get(2)).toBe(1);
			expect(mappings.recIdxMap.get(3)).toBe(2);

			expect(mappings.contribIdxMap.get(1)).toBe(0);
			expect(mappings.contribIdxMap.get(2)).toBe(1);
			expect(mappings.contribIdxMap.get(3)).toBe(2);

			expect(mappings.propertyMap.get('prop1')).toBe(0);
			expect(mappings.propertyMap.get('prop2')).toBe(1);
			expect(mappings.propertyMap.size).toBe(2);
		});

		it('should handle contributions without transitions', () => {
			const recommendations: RecommendationWithContributions[] = [];
			const contributions: ContributionWithTransition[] = [
				{ id: 1, transition: null } as ContributionWithTransition
			];

			const mappings = service['createIndexMappings'](recommendations, contributions);

			expect(mappings.propertyMap.size).toBe(0);
			expect(mappings.contribIdxMap.size).toBe(1);
		});
	});

	describe('createZ3Functions', () => {
		it('should create all required Z3 functions', () => {
			const mockZ3 = {
				Int: { sort: jest.fn().mockReturnValue({}) },
				Function: { declare: jest.fn().mockReturnValue({}) }
			} as any;

			const functions = service['createZ3Functions'](mockZ3);

			expect(functions.strengthFunc).toBeDefined();
			expect(functions.contribRecIdFunc).toBeDefined();
			expect(functions.valueFunc).toBeDefined();
			expect(functions.derivativeFunc).toBeDefined();
			expect(functions.propertyFunc).toBeDefined();

			expect(mockZ3.Function.declare).toHaveBeenCalledTimes(5);
		});
	});

	describe('addRulesConstraints', () => {
		it('should add recommendation constraints', () => {
			const mockSolver = { add: jest.fn() };
			const mockVariables = {
				i1: { ge: jest.fn().mockReturnValue({}), lt: jest.fn().mockReturnValue({}) },
				i2: { ge: jest.fn().mockReturnValue({}), lt: jest.fn().mockReturnValue({}) }
			};
			const mockRule = { entity: 'recommendation' as InteractionEntity };
			const recommendations = [{}, {}] as RecommendationWithContributions[];
			const contributions = [] as ContributionWithTransition[];

			service['addRulesConstraints'](
				mockSolver as any,
				mockVariables as any,
				mockRule as InteractionRule,
				recommendations,
				contributions
			);

			expect(mockSolver.add).toHaveBeenCalledTimes(2);
			expect(mockVariables.i1.ge).toHaveBeenCalledWith(0);
			expect(mockVariables.i1.lt).toHaveBeenCalledWith(2);
			expect(mockVariables.i2.ge).toHaveBeenCalledWith(0);
			expect(mockVariables.i2.lt).toHaveBeenCalledWith(2);
		});

		it('should add contribution constraints', () => {
			const mockSolver = { add: jest.fn() };
			const mockVariables = {
				i1: { ge: jest.fn().mockReturnValue({}), lt: jest.fn().mockReturnValue({}) },
				i2: { ge: jest.fn().mockReturnValue({}), lt: jest.fn().mockReturnValue({}) }
			};
			const mockRule = { entity: 'contribution' as InteractionEntity };
			const recommendations = [] as RecommendationWithContributions[];
			const contributions = [{}, {}, {}] as ContributionWithTransition[];

			service['addRulesConstraints'](
				mockSolver as any,
				mockVariables as any,
				mockRule as InteractionRule,
				recommendations,
				contributions
			);

			expect(mockSolver.add).toHaveBeenCalledTimes(2);
			expect(mockVariables.i1.lt).toHaveBeenCalledWith(3);
			expect(mockVariables.i2.lt).toHaveBeenCalledWith(3);
		});
	});
});
