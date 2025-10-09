/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from './entities/recommendation.entity';
import { ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { createMockDatabaseService } from 'test/utils';
import { recommendationCreateStub, recommendationStub } from 'test/fixtures/recommendation.stub';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { sessionStub } from 'test/fixtures/session.stub';

describe('RecommendationController', () => {
	let controller: RecommendationController;
	let service: jest.Mocked<RecommendationService>;

	beforeEach(async () => {
		service = {
			create: jest.fn(),
			findAll: jest.fn(),
			findAllByUser: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			remove: jest.fn()
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [RecommendationController],
			providers: [
				{ provide: RecommendationService, useValue: service },
				createMockDatabaseService()
			]
		}).compile();

		controller = module.get<RecommendationController>(RecommendationController);
	});

	describe('create', () => {
		it('should create a recommendation', async () => {
			service.create.mockResolvedValue(new Recommendation(recommendationStub));
			const result = await controller.create(recommendationCreateStub);
			expect(result).toBeInstanceOf(Recommendation);
			expect(service.create).toHaveBeenCalledWith(recommendationCreateStub);
		});

		it('should fail validation for missing action', async () => {
			const dto: any = { strength: 'STRONG', guidelineId: 2 };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateRecommendationDto })
			).rejects.toThrow();
		});

		it('should fail validation for invalid strength', async () => {
			const dto: any = { action: 'Test', strength: 'INVALID', guidelineId: 2 };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateRecommendationDto })
			).rejects.toThrow();
		});
	});

	describe('findAllByUser', () => {
		it('should return all recommendations for the authenticated user', async () => {
			service.findAllByUser.mockResolvedValue([new Recommendation(recommendationStub)]);
			const result = await controller.findAllByUser(sessionStub as any);
			expect(result[0]).toBeInstanceOf(Recommendation);
			expect(service.findAllByUser).toHaveBeenCalledWith(sessionStub.user.id);
		});

		it('should return empty array when user id is undefined', async () => {
			service.findAllByUser.mockResolvedValue([]);
			const mockSession = { ...sessionStub, user: { id: undefined } };
			const result = await controller.findAllByUser(mockSession as any);
			expect(result).toEqual([]);
			expect(service.findAllByUser).toHaveBeenCalledWith(undefined);
		});
	});

	describe('findAll', () => {
		it('should return all recommendations for a guideline', async () => {
			service.findAll.mockResolvedValue([new Recommendation(recommendationStub)]);
			const result = await controller.findAll(2);
			expect(result[0]).toBeInstanceOf(Recommendation);
			expect(service.findAll).toHaveBeenCalledWith(2);
		});

		it('should throw an error if guidelineId is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('findOne', () => {
		it('should return a recommendation', async () => {
			service.findOne.mockResolvedValue(new Recommendation(recommendationStub));
			const result = await controller.findOne(1);
			expect(result).toBeInstanceOf(Recommendation);
			expect(service.findOne).toHaveBeenCalledWith(1);
		});

		it('should throw an error if id is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('update', () => {
		it('should update and return a recommendation', async () => {
			service.update.mockResolvedValue(new Recommendation(recommendationStub));
			const dto = { action: 'Updated' };
			const result = await controller.update(1, dto);
			expect(result).toBeInstanceOf(Recommendation);
			expect(service.update).toHaveBeenCalledWith(1, dto);
		});

		it('should fail validation if the strength is invalid', async () => {
			const dto: any = { action: 'Updated', strength: 'INVALID' };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: UpdateRecommendationDto })
			).rejects.toThrow();
		});
	});

	describe('remove', () => {
		it('should remove and return a recommendation', async () => {
			service.remove.mockResolvedValue(recommendationStub);
			const result = await controller.remove(1);
			expect(result).toEqual(recommendationStub);
			expect(service.remove).toHaveBeenCalledWith(1);
		});
	});
});
