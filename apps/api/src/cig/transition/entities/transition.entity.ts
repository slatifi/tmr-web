import { ApiProperty } from '@nestjs/swagger';
import { Derivative, Situation, Transition as TransitionModel } from '@prisma/client';

export class Transition implements TransitionModel {
	constructor(partial: Partial<Transition>) {
		Object.assign(this, partial);
	}

	id: number;
	createdAt: Date;
	updatedAt: Date;
	property: string;
	contributionId: number;

	@ApiProperty({ enum: Situation })
	pre: Situation;

	@ApiProperty({ enum: Situation })
	post: Situation;

	@ApiProperty({ enum: Derivative })
	derivative: Derivative;
}
