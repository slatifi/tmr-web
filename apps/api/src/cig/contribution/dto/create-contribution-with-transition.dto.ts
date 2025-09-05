import { ApiProperty } from '@nestjs/swagger';
import { ContributionValue, Situation, Derivative } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateContributionWithTransitionDto {
	@IsEnum(ContributionValue)
	@IsNotEmpty()
	@ApiProperty({ enum: ContributionValue })
	value: ContributionValue;

	@IsNotEmpty()
	@IsInt()
	recommendationId: number;

	// New properties for transition
	@IsString()
	@IsNotEmpty()
	property: string;

	@IsEnum(Situation)
	@IsNotEmpty()
	@ApiProperty({ enum: Situation })
	pre: Situation;

	@IsEnum(Situation)
	@IsNotEmpty()
	@ApiProperty({ enum: Situation })
	post: Situation;

	@IsEnum(Derivative)
	@IsNotEmpty()
	@ApiProperty({ enum: Derivative })
	derivative: Derivative;
}
