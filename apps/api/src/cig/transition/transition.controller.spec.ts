import { Test, TestingModule } from '@nestjs/testing';
import { TransitionController } from './transition.controller';
import { TransitionService } from './transition.service';
import { DatabaseModule } from '@/database/database.module';

describe('TransitionController', () => {
	let controller: TransitionController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [DatabaseModule],
			controllers: [TransitionController],
			providers: [TransitionService]
		}).compile();

		controller = module.get<TransitionController>(TransitionController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
