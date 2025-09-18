import { IsSnomedCode } from '@/common/validation/is-snomed-code.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { RecommendationStrength } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecommendationDto {
	@IsString()
	@IsNotEmpty()
	@IsSnomedCode()
	action: string;

	@IsString()
	@IsOptional()
	actionPrefix: string | null;

	@IsEnum(RecommendationStrength)
	@IsNotEmpty()
	@ApiProperty({ enum: RecommendationStrength })
	strength: RecommendationStrength;

	@IsInt()
	@IsNotEmpty()
	guidelineId: number;
}
