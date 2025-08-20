import { ApiHideProperty } from '@nestjs/swagger';
import { Contribution, Recommendation, Transition } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ExpandedGuideline {
	constructor(partial: Partial<ExpandedGuideline>) {
		Object.assign(this, partial);
	}

	id: number;
	title: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;

	@Exclude()
	@ApiHideProperty()
	userId: string;

	recommendations: (Recommendation & {
		contributions: (Contribution & {
			transition: Transition;
		})[];
	})[];
}
