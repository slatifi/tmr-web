import { Test, TestingModule } from '@nestjs/testing';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { DatabaseModule } from '@/database/database.module';

describe('ContributionController', () => {
	let controller: ContributionController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			controllers: [ContributionController],
			providers: [ContributionService]
		}).compile();

		controller = module.get<ContributionController>(ContributionController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
