import { Guideline as GuidelineModel } from '@prisma/client';

export class Guideline implements GuidelineModel {
	constructor(partial: Partial<Guideline>) {
		Object.assign(this, partial);
	}

	id: number;
	title: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	public: boolean;
	userId: string;
}
