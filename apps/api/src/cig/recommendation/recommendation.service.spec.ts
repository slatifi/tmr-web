/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { DatabaseService } from '@/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { Recommendation } from './entities/recommendation.entity';
import { mockReset } from 'jest-mock-extended';
import { recommendationStub, recommendationCreateStub } from 'test/fixtures/recommendation.stub';
import { createMockDatabaseService } from 'test/utils';

describe('RecommendationService', () => {
	let service: RecommendationService;
	let db: ReturnType<typeof createMockDatabaseService>['useValue'];

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [RecommendationService, createMockDatabaseService()]
		}).compile();

		service = module.get<RecommendationService>(RecommendationService);
		db = module.get(DatabaseService);
		mockReset(db.recommendation);
	});

	describe('create', () => {
		it('should create and return a recommendation', async () => {
			db.recommendation.create.mockResolvedValue(recommendationStub);

			const result = await service.create(recommendationCreateStub);
			expect(result).toBeInstanceOf(Recommendation);
			expect(db.recommendation.create).toHaveBeenCalled();
		});

		it('should throw an error if the guidelineId doesnt exist', async () => {
			db.recommendation.create.mockRejectedValue(new Error('Guideline not found'));
			await expect(service.create(recommendationCreateStub)).rejects.toThrow('Guideline not found');
		});
	});
	describe('findAllByUser', () => {
		it('should return all recommendations for a user', async () => {
			db.recommendation.findMany.mockResolvedValue([recommendationStub]);
			const result = await service.findAllByUser('user-123');
			expect(result[0]).toBeInstanceOf(Recommendation);
			expect(db.recommendation.findMany).toHaveBeenCalledWith({
				where: { guideline: { userId: 'user-123' } }
			});
		});

		it('should return an empty array if userId is null', async () => {
			const result = await service.findAllByUser(null as any);
			expect(result).toEqual([]);
			expect(db.recommendation.findMany).not.toHaveBeenCalled();
		});

		it('should return an empty array if userId is undefined', async () => {
			const result = await service.findAllByUser(undefined as any);
			expect(result).toEqual([]);
			expect(db.recommendation.findMany).not.toHaveBeenCalled();
		});

		it('should return an empty array if userId is not a string', async () => {
			const result = await service.findAllByUser(123 as any);
			expect(result).toEqual([]);
			expect(db.recommendation.findMany).not.toHaveBeenCalled();
		});

		it('should return an empty array if no recommendations found for user', async () => {
			db.recommendation.findMany.mockResolvedValue([]);
			const result = await service.findAllByUser('user-999');
			expect(result).toEqual([]);
			expect(db.recommendation.findMany).toHaveBeenCalledWith({
				where: { guideline: { userId: 'user-999' } }
			});
		});
	});

	describe('findAll', () => {
		it('should return all recommendations for a guideline', async () => {
			db.recommendation.findMany.mockResolvedValue([recommendationStub]);
			const result = await service.findAll(2);
			expect(result[0]).toBeInstanceOf(Recommendation);
			expect(db.recommendation.findMany).toHaveBeenCalledWith({
				where: { guidelineId: 2 },
				orderBy: { createdAt: 'desc' }
			});
		});

		it('should return an empty array if no recommendations found', async () => {
			db.recommendation.findMany.mockResolvedValue([]);
			const result = await service.findAll(999);
			expect(result).toEqual([]);
			expect(db.recommendation.findMany).toHaveBeenCalledWith({
				where: { guidelineId: 999 },
				orderBy: { createdAt: 'desc' }
			});
		});
	});

	describe('findOne', () => {
		it('should return a recommendation by id', async () => {
			db.recommendation.findUnique.mockResolvedValue(recommendationStub);
			const result = await service.findOne(1);
			expect(result).toBeInstanceOf(Recommendation);
			expect(db.recommendation.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it('should throw NotFoundException if not found', async () => {
			db.recommendation.findUnique.mockResolvedValue(null);
			await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update and return a recommendation', async () => {
			db.recommendation.update.mockResolvedValue(recommendationStub);
			const result = await service.update(1, { action: 'Updated' });
			expect(result).toBeInstanceOf(Recommendation);
			expect(db.recommendation.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { action: 'Updated' }
			});
		});

		it('should throw NotFoundException if update returns null', async () => {
			// @ts-expect-error mocking missing record
			db.recommendation.update.mockResolvedValue(null);
			await expect(service.update(999, { action: 'none' })).rejects.toThrow(NotFoundException);
		});
	});

	describe('remove', () => {
		it('should delete and return the recommendation', async () => {
			db.recommendation.delete.mockResolvedValue(recommendationStub);
			const result = await service.remove(1);
			expect(result).toEqual(recommendationStub);
			expect(db.recommendation.delete).toHaveBeenCalledWith({ where: { id: 1 } });
		});
	});
});
