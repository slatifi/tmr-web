import { Test, TestingModule } from '@nestjs/testing';
import { TransitionService } from './transition.service';
import { DatabaseService } from '@/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { Transition } from './entities/transition.entity';
import { mockReset } from 'jest-mock-extended';
import { transitionStub, transitionCreateStub } from 'test/fixtures/transition.stub';
import { createMockDatabaseService } from 'test/utils';

describe('TransitionService', () => {
	let service: TransitionService;
	let db: ReturnType<typeof createMockDatabaseService>['useValue'];

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TransitionService, createMockDatabaseService()]
		}).compile();

		service = module.get<TransitionService>(TransitionService);
		db = module.get(DatabaseService);
		mockReset(db.transition);
	});

	describe('create', () => {
		it('should create and return a transition', async () => {
			db.transition.create.mockResolvedValue(transitionStub);
			const result = await service.create(transitionCreateStub);
			expect(result).toBeInstanceOf(Transition);
			expect(db.transition.create).toHaveBeenCalled();
		});
	});

	describe('findAll', () => {
		it('should return all transitions for a contribution', async () => {
			db.transition.findMany.mockResolvedValue([transitionStub]);
			const result = await service.findAll(2);
			expect(result[0]).toBeInstanceOf(Transition);
			expect(db.transition.findMany).toHaveBeenCalledWith({
				where: { contributionId: 2 },
				orderBy: { createdAt: 'desc' }
			});
		});
	});

	describe('findOne', () => {
		it('should return a transition by id', async () => {
			db.transition.findUnique.mockResolvedValue(transitionStub);
			const result = await service.findOne(1);
			expect(result).toBeInstanceOf(Transition);
			expect(db.transition.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it('should throw NotFoundException if not found', async () => {
			db.transition.findUnique.mockResolvedValue(null);
			await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update and return a transition', async () => {
			db.transition.update.mockResolvedValue(transitionStub);
			const result = await service.update(1, { property: 'updated' });
			expect(result).toBeInstanceOf(Transition);
			expect(db.transition.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { property: 'updated' }
			});
		});

		it('should throw NotFoundException if update returns null', async () => {
			// @ts-expect-error mocking missing record
			db.transition.update.mockResolvedValue(null);
			await expect(service.update(999, { property: 'none' })).rejects.toThrow(NotFoundException);
		});
	});

	describe('remove', () => {
		it('should delete and return the transition', async () => {
			db.transition.delete.mockResolvedValue(transitionStub);
			const result = await service.remove(1);
			expect(result).toEqual(transitionStub);
			expect(db.transition.delete).toHaveBeenCalledWith({ where: { id: 1 } });
		});
	});
});
