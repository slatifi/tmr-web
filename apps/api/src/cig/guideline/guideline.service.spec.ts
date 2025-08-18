import { Test, TestingModule } from '@nestjs/testing';
import { GuidelineService } from './guideline.service';
import { DatabaseModule } from '@/database/database.module';

describe('GuidelineService', () => {
	let service: GuidelineService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [GuidelineService]
		}).compile();

		service = module.get<GuidelineService>(GuidelineService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
