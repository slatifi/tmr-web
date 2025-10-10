import { Contribution, Recommendation, Transition } from '@prisma/client';

export class ExpandedGuideline {
	constructor(partial: Partial<ExpandedGuideline>) {
		Object.assign(this, partial);
	}

	id: number;
	title: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	public: boolean;
	userId: string;

	recommendations: (Recommendation & {
		contributions: (Contribution & {
			transition: Transition;
		})[];
	})[];
}
