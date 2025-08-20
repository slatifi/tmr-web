import { Test, TestingModule } from '@nestjs/testing';
import { TransitionController } from './transition.controller';
import { TransitionService } from './transition.service';
import { Transition } from './entities/transition.entity';
import { ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { createMockDatabaseService } from 'test/utils';
import { transitionStub, transitionCreateStub } from 'test/fixtures/transition.stub';
import { CreateTransitionDto } from './dto/create-transition.dto';

describe('TransitionController', () => {
	let controller: TransitionController;
	let service: jest.Mocked<TransitionService>;

	beforeEach(async () => {
		service = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			remove: jest.fn()
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TransitionController],
			providers: [{ provide: TransitionService, useValue: service }, createMockDatabaseService()]
		}).compile();

		controller = module.get<TransitionController>(TransitionController);
	});

	describe('create', () => {
		it('should create a transition', async () => {
			service.create.mockResolvedValue(new Transition(transitionStub));
			const result = await controller.create(transitionCreateStub);
			expect(result).toBeInstanceOf(Transition);
			expect(service.create).toHaveBeenCalledWith(transitionCreateStub);
		});

		it('should fail validation for missing property', async () => {
			const dto: any = { pre: 'LOW', post: 'NORMAL', derivative: 'INCREASE', contributionId: 2 };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateTransitionDto })
			).rejects.toThrow();
		});

		it('should fail validation for invalid siuation', async () => {
			const dto = { ...transitionCreateStub, pre: 'INVALID' };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateTransitionDto })
			).rejects.toThrow();
		});
	});

	describe('findAll', () => {
		it('should return all transitions for a contribution', async () => {
			service.findAll.mockResolvedValue([new Transition(transitionStub)]);
			const result = await controller.findAll(2);
			expect(result[0]).toBeInstanceOf(Transition);
			expect(service.findAll).toHaveBeenCalledWith(2);
		});

		it('should fail if contributionId is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('findOne', () => {
		it('should return a transition', async () => {
			service.findOne.mockResolvedValue(new Transition(transitionStub));
			const result = await controller.findOne(1);
			expect(result).toBeInstanceOf(Transition);
			expect(service.findOne).toHaveBeenCalledWith(1);
		});

		it('should fail if id is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('update', () => {
		it('should update and return a transition', async () => {
			service.update.mockResolvedValue(new Transition(transitionStub));
			const dto = { property: 'updated' };
			const result = await controller.update(1, dto);
			expect(result).toBeInstanceOf(Transition);
			expect(service.update).toHaveBeenCalledWith(1, dto);
		});

		it('should fail validation for an invalid situation', async () => {
			const dto: any = { pre: 'INVALID' };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateTransitionDto })
			).rejects.toThrow();
		});
	});

	describe('remove', () => {
		it('should remove and return a transition', async () => {
			service.remove.mockResolvedValue(transitionStub);
			const result = await controller.remove(1);
			expect(result).toEqual(transitionStub);
			expect(service.remove).toHaveBeenCalledWith(1);
		});
	});
});
