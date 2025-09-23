import { Prisma } from '@prisma/client';

export type ContributionWithTransition = Prisma.ContributionGetPayload<{
	include: {
		transition: true;
	};
}>;
