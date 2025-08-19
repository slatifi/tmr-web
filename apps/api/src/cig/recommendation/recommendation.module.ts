import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
	imports: [DatabaseModule],
	controllers: [RecommendationController],
	providers: [RecommendationService]
})
export class RecommendationModule {}
