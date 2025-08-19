import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { DatabaseModule } from '@/database/database.module';

describe('RecommendationController', () => {
	let controller: RecommendationController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			controllers: [RecommendationController],
			providers: [RecommendationService]
		}).compile();

		controller = module.get<RecommendationController>(RecommendationController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
