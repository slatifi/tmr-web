import { CreateGuidelineDto } from '@/cig/guideline/dto/create-guideline.dto';
import { ExpandedGuideline } from '@/cig/guideline/entities/expanded-guideline.entity';
import { Guideline } from '@/cig/guideline/entities/guideline.entity';

export const guidelineStub = {
	id: 1,
	title: 'Test Guideline',
	description: 'Test Description',
	createdAt: new Date(),
	updatedAt: new Date(),
	userId: 'user-1'
} as Guideline;

export const guidelineCreateStub = {
	title: 'Test Guideline',
	description: 'Test Description',
	userId: 'user-1'
} as CreateGuidelineDto;

export const expandedGuidelineStub = {
	...guidelineStub,
	recommendations: [
		{
			id: 1,
			contributions: [
				{
					id: 1,
					transition: { id: 1 }
				}
			]
		}
	]
} as ExpandedGuideline;
