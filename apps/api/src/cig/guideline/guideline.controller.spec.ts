import { Test, TestingModule } from '@nestjs/testing';
import { GuidelineController } from './guideline.controller';
import { GuidelineService } from './guideline.service';
import { DatabaseModule } from '@/database/database.module';

describe('GuidelineController', () => {
	let controller: GuidelineController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			controllers: [GuidelineController],
			providers: [GuidelineService]
		}).compile();

		controller = module.get<GuidelineController>(GuidelineController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
