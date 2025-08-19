import { ApiProperty } from '@nestjs/swagger';
import { Contribution as ContributionModel, ContributionValue } from '@prisma/client';

export class Contribution implements ContributionModel {
	constructor(partial: Partial<Contribution>) {
		Object.assign(this, partial);
	}

	id: number;
	createdAt: Date;
	updatedAt: Date;
	recommendationId: number;

	@ApiProperty({ enum: ContributionValue })
	value: ContributionValue;
}
