import { Test, TestingModule } from '@nestjs/testing';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { Contribution } from './entities/contribution.entity';
import { ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { createMockDatabaseService } from 'test/utils';
import { contributionStub, contributionCreateStub } from 'test/fixtures/contribution.stub';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';

describe('ContributionController', () => {
	let controller: ContributionController;
	let service: jest.Mocked<ContributionService>;

	beforeEach(async () => {
		service = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			remove: jest.fn()
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ContributionController],
			providers: [{ provide: ContributionService, useValue: service }, createMockDatabaseService()]
		}).compile();

		controller = module.get<ContributionController>(ContributionController);
	});

	describe('create', () => {
		it('should create a contribution', async () => {
			service.create.mockResolvedValue(new Contribution(contributionStub));
			const result = await controller.create(contributionCreateStub);
			expect(result).toBeInstanceOf(Contribution);
			expect(service.create).toHaveBeenCalledWith(contributionCreateStub);
		});

		it('should fail validation for missing value', async () => {
			const dto: any = { recommendationId: 2 };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateContributionDto })
			).rejects.toThrow();
		});

		it('should fail if the value is not valid', async () => {
			const dto: any = { value: 'INVALID', recommendationId: 2 };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: CreateContributionDto })
			).rejects.toThrow();
		});
	});

	describe('findAll', () => {
		it('should return all contributions for a recommendation', async () => {
			service.findAll.mockResolvedValue([new Contribution(contributionStub)]);
			const result = await controller.findAll(2);
			expect(result[0]).toBeInstanceOf(Contribution);
			expect(service.findAll).toHaveBeenCalledWith(2);
		});

		it('should fail if recommendationId is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('findOne', () => {
		it('should return a contribution', async () => {
			service.findOne.mockResolvedValue(new Contribution(contributionStub));
			const result = await controller.findOne(1);
			expect(result).toBeInstanceOf(Contribution);
			expect(service.findOne).toHaveBeenCalledWith(1);
		});

		it('should throw an error if id is not a number', async () => {
			const pipe = new ParseIntPipe();
			await expect(pipe.transform('INVALID', { type: 'param' })).rejects.toThrow();
		});
	});

	describe('update', () => {
		it('should update and return a contribution', async () => {
			service.update.mockResolvedValue(new Contribution(contributionStub));
			const dto: UpdateContributionDto = { value: 'NEUTRAL' };
			const result = await controller.update(1, dto);
			expect(result).toBeInstanceOf(Contribution);
			expect(service.update).toHaveBeenCalledWith(1, dto);
		});

		it('should fail validation for invalid value', async () => {
			const dto: any = { value: 'INVALID' };
			const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
			await expect(
				pipe.transform(dto, { type: 'body', metatype: UpdateContributionDto })
			).rejects.toThrow();
		});
	});

	describe('remove', () => {
		it('should remove and return a contribution', async () => {
			service.remove.mockResolvedValue(contributionStub);
			const result = await controller.remove(1);
			expect(result).toEqual(contributionStub);
			expect(service.remove).toHaveBeenCalledWith(1);
		});
	});
});
