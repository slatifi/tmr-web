import { CreateRecommendationDto } from '@/cig/recommendation/dto/create-recommendation.dto';
import { Recommendation } from '@/cig/recommendation/entities/recommendation.entity';

export const recommendationStub = {
	id: 1,
	action: 'Test Action',
	actionPrefix: 'Take',
	strength: 'SHOULD',
	guidelineId: 2,
	createdAt: new Date(),
	updatedAt: new Date()
} as Recommendation;

export const recommendationCreateStub = {
	action: 'Test Action',
	strength: 'SHOULD',
	guidelineId: 2
} as CreateRecommendationDto;
