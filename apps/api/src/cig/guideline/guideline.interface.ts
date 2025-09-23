import { Prisma } from '@prisma/client';

export type GuidelineWithRecs = Prisma.GuidelineGetPayload<{
	include: {
		recommendations: {
			include: {
				contributions: {
					include: {
						transition: true;
					};
				};
			};
		};
	};
}>;
