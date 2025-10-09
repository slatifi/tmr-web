import { Test, TestingModule } from '@nestjs/testing';
import { GuidelineService } from './guideline.service';
import { DatabaseService } from '@/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { Guideline } from './entities/guideline.entity';
import { ExpandedGuideline } from './entities/expanded-guideline.entity';
import {
	guidelineStub,
	expandedGuidelineStub,
	guidelineCreateStub
} from 'test/fixtures/guideline.stub';

import { mockReset } from 'jest-mock-extended';
import { instanceToPlain } from 'class-transformer';
import { createMockDatabaseService } from 'test/utils';

describe('GuidelineService', () => {
	let service: GuidelineService;
	let db: ReturnType<typeof createMockDatabaseService>['useValue'];

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GuidelineService,
				createMockDatabaseService() // Mocking DatabaseService
			]
		}).compile();

		service = module.get<GuidelineService>(GuidelineService);
		db = module.get(DatabaseService);
		mockReset(db.guideline);
	});

	describe('create', () => {
		it('should create and return a guideline', async () => {
			db.guideline.create.mockResolvedValue(guidelineStub as Guideline);
			const result = await service.create(guidelineCreateStub, 'user-1');
			expect(result).toBeInstanceOf(Guideline);
			expect(db.guideline.create).toHaveBeenCalled();
		});

		it('should throw NotFoundException if userId is not found', async () => {
			db.guideline.create.mockRejectedValue(new NotFoundException('User not found'));
			await expect(service.create(guidelineCreateStub, 'user-999')).rejects.toThrow(
				NotFoundException
			);
		});
	});

	describe('findAll', () => {
		it('should return all guidelines for a user when mine=true', async () => {
			db.guideline.findMany.mockResolvedValue([guidelineStub] as Guideline[]);
			const result = await service.findAll('user-1', true);
			expect(result[0]).toBeInstanceOf(Guideline);
			expect(db.guideline.findMany).toHaveBeenCalledWith({
				where: { userId: 'user-1' },
				orderBy: { createdAt: 'desc' }
			});
		});

		it('should return public and own guidelines when mine=false', async () => {
			db.guideline.findMany.mockResolvedValue([guidelineStub] as Guideline[]);
			const result = await service.findAll('user-1', false);
			expect(result[0]).toBeInstanceOf(Guideline);
			expect(db.guideline.findMany).toHaveBeenCalledWith({
				where: { OR: [{ public: true }, { userId: 'user-1' }] },
				orderBy: { createdAt: 'desc' }
			});
		});
	});

	describe('findOne', () => {
		it('should return a guideline by id when deep=false', async () => {
			db.guideline.findUnique.mockResolvedValue(guidelineStub as Guideline);
			const result = await service.findOne(1, false, 'user-1');
			expect(result).toBeInstanceOf(Guideline);
			expect(db.guideline.findUnique).toHaveBeenCalledWith({ where: { id: 1, userId: 'user-1' } });
		});

		it('should return an expanded guideline when deep=true', async () => {
			db.guideline.findFirst.mockResolvedValue(expandedGuidelineStub as ExpandedGuideline);
			const result = await service.findOne(1, true, 'user-1');
			expect(result).toBeInstanceOf(ExpandedGuideline);
			expect(db.guideline.findFirst).toHaveBeenCalledWith({
				where: { id: 1, OR: [{ public: true }, { userId: 'user-1' }] },
				include: {
					recommendations: {
						include: {
							contributions: {
								include: {
									transition: true
								}
							}
						}
					}
				}
			});
		});

		it('should throw NotFoundException if not found', async () => {
			db.guideline.findUnique.mockResolvedValue(null);
			await expect(service.findOne(999, false, 'user-1')).rejects.toThrow(NotFoundException);
		});

		it('should filter out the userId field from the Prisma response', async () => {
			db.guideline.findUnique.mockResolvedValue(guidelineStub as Guideline);
			const result = await service.findOne(1, false, 'user-1');
			expect(result).toBeInstanceOf(Guideline);
			const filtered = instanceToPlain(result);
			expect(filtered.userId).toBeUndefined();
		});
	});

	describe('update', () => {
		it('should update and return a guideline', async () => {
			db.guideline.update.mockResolvedValue(guidelineStub as Guideline);
			const result = await service.update(1, { title: 'Updated' });
			expect(result).toBeInstanceOf(Guideline);
			expect(db.guideline.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { title: 'Updated' }
			});
		});

		it('should throw NotFoundException if update returns null', async () => {
			// @ts-expect-error mocking update to return null
			db.guideline.update.mockResolvedValue(null);
			await expect(service.update(999, { title: 'none' })).rejects.toThrow(NotFoundException);
		});
	});

	describe('remove', () => {
		it('should delete and return the guideline', async () => {
			db.guideline.delete.mockResolvedValue(guidelineStub as Guideline);
			const result = await service.remove(1);
			expect(result).toEqual(guidelineStub);
			expect(db.guideline.delete).toHaveBeenCalledWith({ where: { id: 1 } });
		});
	});
});
