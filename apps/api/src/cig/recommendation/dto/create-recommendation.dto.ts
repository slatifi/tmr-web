import { ApiProperty } from '@nestjs/swagger';
import { RecommendationStrength } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateRecommendationDto {
	@IsString()
	@IsNotEmpty()
	action: string;

	@IsEnum(RecommendationStrength)
	@IsNotEmpty()
	@ApiProperty({ enum: RecommendationStrength })
	strength: RecommendationStrength;

	@IsInt()
	@IsNotEmpty()
	guidelineId: number;
}
