import { Test, TestingModule } from '@nestjs/testing';
import { ContributionService } from './contribution.service';
import { DatabaseService } from '@/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { Contribution } from './entities/contribution.entity';
import { mockReset } from 'jest-mock-extended';
import { contributionStub, contributionCreateStub } from 'test/fixtures/contribution.stub';
import { createMockDatabaseService } from 'test/utils';

describe('ContributionService', () => {
	let service: ContributionService;
	let db: ReturnType<typeof createMockDatabaseService>['useValue'];

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ContributionService, createMockDatabaseService()]
		}).compile();

		service = module.get<ContributionService>(ContributionService);
		db = module.get(DatabaseService);
		mockReset(db.contribution);
	});

	describe('create', () => {
		it('should create and return a contribution', async () => {
			db.contribution.create.mockResolvedValue(contributionStub);
			const result = await service.create(contributionCreateStub);
			expect(result).toBeInstanceOf(Contribution);
			expect(db.contribution.create).toHaveBeenCalled();
		});
	});

	describe('findAll', () => {
		it('should return all contributions for a recommendation', async () => {
			db.contribution.findMany.mockResolvedValue([contributionStub]);
			const result = await service.findAll(2);
			expect(result[0]).toBeInstanceOf(Contribution);
			expect(db.contribution.findMany).toHaveBeenCalledWith({
				where: { recommendationId: 2 },
				orderBy: { createdAt: 'desc' }
			});
		});
	});

	describe('findOne', () => {
		it('should return a contribution by id', async () => {
			db.contribution.findUnique.mockResolvedValue(contributionStub);
			const result = await service.findOne(1);
			expect(result).toBeInstanceOf(Contribution);
			expect(db.contribution.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it('should throw NotFoundException if not found', async () => {
			db.contribution.findUnique.mockResolvedValue(null);
			await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update and return a contribution', async () => {
			db.contribution.update.mockResolvedValue(contributionStub);
			const result = await service.update(1, { value: 'NEUTRAL' });
			expect(result).toBeInstanceOf(Contribution);
			expect(db.contribution.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { value: 'NEUTRAL' }
			});
		});

		it('should throw NotFoundException if update returns null', async () => {
			// @ts-expect-error mocking missing record
			db.contribution.update.mockResolvedValue(null);
			await expect(service.update(999, { value: 'NEUTRAL' })).rejects.toThrow(NotFoundException);
		});
	});

	describe('remove', () => {
		it('should delete and return the contribution', async () => {
			db.contribution.delete.mockResolvedValue(contributionStub);
			const result = await service.remove(1);
			expect(result).toEqual(contributionStub);
			expect(db.contribution.delete).toHaveBeenCalledWith({ where: { id: 1 } });
		});
	});
});
