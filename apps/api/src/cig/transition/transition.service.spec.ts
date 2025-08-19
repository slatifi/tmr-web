import { Test, TestingModule } from '@nestjs/testing';
import { TransitionService } from './transition.service';
import { DatabaseModule } from '@/database/database.module';

describe('TransitionService', () => {
	let service: TransitionService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [TransitionService]
		}).compile();

		service = module.get<TransitionService>(TransitionService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
