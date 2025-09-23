import { Prisma } from '@prisma/client';

export type RecommendationWithContributions = Prisma.RecommendationGetPayload<{
	include: {
		contributions: {
			include: {
				transition: true;
			};
		};
	};
}>;
