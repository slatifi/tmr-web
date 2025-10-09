/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { GuidelineController } from './guideline.controller';
import { GuidelineService } from './guideline.service';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { Guideline } from './entities/guideline.entity';
import { ExpandedGuideline } from './entities/expanded-guideline.entity';
import { ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { createMockDatabaseService } from 'test/utils';
import {
	guidelineStub,
	expandedGuidelineStub,
	guidelineCreateStub
} from 'test/fixtures/guideline.stub';
import { sessionStub } from 'test/fixtures/session.stub';

describe('GuidelineController', () => {
	let controller: GuidelineController;
	let service: jest.Mocked<GuidelineService>;

	beforeEach(async () => {
		service = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			remove: jest.fn()
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [GuidelineController],
			providers: [{ provide: GuidelineService, useValue: service }, createMockDatabaseService()]
		}).compile();

		controller = module.get<GuidelineController>(GuidelineController);
	});

	describe('create', () => {
		it('should create a guideline', async () => {
			service.create.mockResolvedValue(new Guideline(guidelineStub));
			const dto = guidelineCreateStub;
			// @ts-expect-error mocking session
			const result = await controller.create(dto, sessionStub);
			expect(result).toBeInstanceOf(Guideline);
			expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
		});

		it('should fail validation for missing title', async () => {
			const dto: any = { description: 'desc' };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateGuidelineDto })
			).rejects.toThrow();
		});
	});

	describe('findAll', () => {
		it('should return all guidelines for user with mine=true by default', async () => {
			service.findAll.mockResolvedValue([new Guideline(guidelineStub)]);
			// @ts-expect-error mocking session
			const result = await controller.findAll(true, sessionStub);
			expect(result[0]).toBeInstanceOf(Guideline);
			expect(service.findAll).toHaveBeenCalledWith('user-1', true);
		});

		it('should return public and own guidelines when mine=false', async () => {
			service.findAll.mockResolvedValue([new Guideline(guidelineStub)]);
			// @ts-expect-error mocking session
			const result = await controller.findAll(false, sessionStub);
			expect(result[0]).toBeInstanceOf(Guideline);
			expect(service.findAll).toHaveBeenCalledWith('user-1', false);
		});
	});

	describe('findOneDeep', () => {
		it('should return expanded guideline with userId for access control', async () => {
			service.findOne.mockResolvedValue(new ExpandedGuideline(expandedGuidelineStub));
			const result = await controller.findOneDeep(1, sessionStub as any);
			expect(result).toBeInstanceOf(ExpandedGuideline);
			expect(service.findOne).toHaveBeenCalledWith(1, true, 'user-1');
		});

		it('should fail if id is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('findOne', () => {
		it('should return guideline', async () => {
			service.findOne.mockResolvedValue(new Guideline(guidelineStub));
			const result = await controller.findOne(1);
			expect(result).toBeInstanceOf(Guideline);
			expect(service.findOne).toHaveBeenCalledWith(1, false);
			expect(result).toEqual(guidelineStub);
		});

		it('should fail if id is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('update', () => {
		it('should update and return guideline', async () => {
			service.update.mockResolvedValue(new Guideline(guidelineStub));
			const dto: UpdateGuidelineDto = { title: 'Updated' };
			const result = await controller.update(1, dto);
			expect(result).toBeInstanceOf(Guideline);
			expect(service.update).toHaveBeenCalledWith(1, dto);
		});

		it('should fail validation for invalid update DTO', async () => {
			const dto: any = { title: '' };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: UpdateGuidelineDto })
			).rejects.toThrow();
		});
	});

	describe('remove', () => {
		it('should remove and return guideline', async () => {
			service.remove.mockResolvedValue(guidelineStub);
			const result = await controller.remove(1);
			expect(result).toEqual(guidelineStub);
			expect(service.remove).toHaveBeenCalledWith(1);
		});
	});
});
