import { IsString, IsNotEmpty, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Derivative, Situation } from '@prisma/client';
import { IsSnomedCode } from '@/common/validation/is-snomed-code.decorator';

export class CreateTransitionDto {
	@IsString()
	@IsNotEmpty()
	@IsSnomedCode()
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

	@IsInt()
	@IsNotEmpty()
	contributionId: number;
}
