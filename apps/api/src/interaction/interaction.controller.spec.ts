/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';
import { GuidelineService } from '@/cig/guideline/guideline.service';
import { expandedGuidelineStub } from 'test/fixtures/guideline.stub';
import { sessionStub } from 'test/fixtures/session.stub';
import { ExpandedGuideline } from '@/cig/guideline/entities/expanded-guideline.entity';

describe('InteractionController', () => {
	let controller: InteractionController;
	let interactionService: jest.Mocked<InteractionService>;
	let guidelineService: jest.Mocked<GuidelineService>;

	beforeEach(async () => {
		const mockInteractionService = {
			findAll: jest.fn()
		};

		const mockGuidelineService = {
			findOne: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [InteractionController],
			providers: [
				{
					provide: InteractionService,
					useValue: mockInteractionService
				},
				{
					provide: GuidelineService,
					useValue: mockGuidelineService
				}
			]
		}).compile();

		controller = module.get<InteractionController>(InteractionController);
		interactionService = module.get(InteractionService);
		guidelineService = module.get(GuidelineService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('findAll', () => {
		it('should return interactions for valid guidelines owned by user', async () => {
			const ids = [1, 2];
			const mockResult = { interactions: [] };

			guidelineService.findOne
				.mockResolvedValueOnce(expandedGuidelineStub as ExpandedGuideline)
				.mockResolvedValueOnce({ ...expandedGuidelineStub, id: 2 } as ExpandedGuideline);
			interactionService.findAll.mockResolvedValue(mockResult);

			const result = await controller.findAll(ids, sessionStub as any);

			expect(guidelineService.findOne).toHaveBeenCalledTimes(2);
			expect(guidelineService.findOne).toHaveBeenCalledWith(1, true, sessionStub.user.id);
			expect(guidelineService.findOne).toHaveBeenCalledWith(2, true, sessionStub.user.id);
			expect(interactionService.findAll).toHaveBeenCalledWith([
				expandedGuidelineStub,
				{ ...expandedGuidelineStub, id: 2 }
			]);
			expect(result).toBe(mockResult);
		});

		it('should filter out null guidelines', async () => {
			const ids = [1, 2];
			const mockResult = { interactions: [] };

			guidelineService.findOne
				.mockResolvedValueOnce(expandedGuidelineStub)
				// @ts-expect-error testing null case
				.mockResolvedValueOnce(null);
			interactionService.findAll.mockResolvedValue(mockResult);

			await controller.findAll(ids, sessionStub as any);

			expect(interactionService.findAll).toHaveBeenCalledWith([expandedGuidelineStub]);
		});

		it('should handle empty ids array', async () => {
			const ids: number[] = [];
			const mockResult = { interactions: [] };

			interactionService.findAll.mockResolvedValue(mockResult);

			const result = await controller.findAll(ids, sessionStub as any);

			expect(guidelineService.findOne).not.toHaveBeenCalled();
			expect(interactionService.findAll).toHaveBeenCalledWith([]);
			expect(result).toBe(mockResult);
		});
	});
});
