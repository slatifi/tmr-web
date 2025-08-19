import { ApiProperty } from '@nestjs/swagger';
import { ContributionValue } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateContributionDto {
	@IsEnum(ContributionValue)
	@IsNotEmpty()
	@ApiProperty({ enum: ContributionValue })
	value: ContributionValue;

	@IsNotEmpty()
	@IsInt()
	recommendationId: number;
}
