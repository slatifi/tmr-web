import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { DatabaseModule } from '@/database/database.module';

describe('RecommendationService', () => {
	let service: RecommendationService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			providers: [RecommendationService]
		}).compile();

		service = module.get<RecommendationService>(RecommendationService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
