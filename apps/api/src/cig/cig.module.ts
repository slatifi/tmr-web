import { Module } from '@nestjs/common';
import { GuidelineModule } from './guideline/guideline.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ContributionModule } from './contribution/contribution.module';
import { TransitionModule } from './transition/transition.module';

@Module({
	imports: [GuidelineModule, RecommendationModule, ContributionModule, TransitionModule]
})
export class CigModule {}
