import { ApiProperty } from '@nestjs/swagger';
import { Recommendation as RecommendationModel } from '@prisma/client';
import { RecommendationStrength } from '@prisma/client';

export class Recommendation implements RecommendationModel {
	constructor(partial: Partial<Recommendation>) {
		Object.assign(this, partial);
	}

	id: number;
	createdAt: Date;
	updatedAt: Date;
	action: string;
	guidelineId: number;

	@ApiProperty({ enum: RecommendationStrength })
	strength: RecommendationStrength;
}
