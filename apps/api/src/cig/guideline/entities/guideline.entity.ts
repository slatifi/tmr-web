import { ApiHideProperty } from '@nestjs/swagger';
import { Guideline as GuidelineModel } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Guideline implements GuidelineModel {
	constructor(partial: Partial<Guideline>) {
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
}
