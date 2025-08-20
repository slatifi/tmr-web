import { CreateContributionDto } from '@/cig/contribution/dto/create-contribution.dto';
import { Contribution } from '@/cig/contribution/entities/contribution.entity';

export const contributionStub = {
	id: 1,
	value: 'POSITIVE',
	recommendationId: 2,
	createdAt: new Date(),
	updatedAt: new Date()
} as Contribution;

export const contributionCreateStub = {
	value: 'POSITIVE',
	recommendationId: 2
} as CreateContributionDto;
