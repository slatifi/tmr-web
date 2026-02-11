import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { Guideline } from './entities/guideline.entity';

export async function copyGuideline(
	db: DatabaseService,
	id: number,
	userId: string
): Promise<Guideline> {
	const original = await db.guideline.findFirst({
		where: {
			id,
			OR: [{ public: true }, { userId }]
		},
		include: {
			recommendations: {
				include: {
					contributions: {
						include: {
							transition: true
						}
					}
				}
			}
		}
	});

	if (!original) {
		throw new NotFoundException(`Guideline with ID ${id} not found`);
	}

	const copiedGuideline = await db.guideline.create({
		data: {
			title: `${original.title} (Copy)`,
			description: original.description,
			public: false,
			userId,
			recommendations: {
				create: original.recommendations.map((rec) => ({
					action: rec.action,
					actionPrefix: rec.actionPrefix,
					strength: rec.strength,
					contributions: {
						create: rec.contributions.map((contrib) => ({
							value: contrib.value,
							transition: contrib.transition
								? {
										create: {
											property: contrib.transition.property,
											pre: contrib.transition.pre,
											post: contrib.transition.post,
											derivative: contrib.transition.derivative
										}
									}
								: undefined
						}))
					}
				}))
			}
		}
	});

	return new Guideline(copiedGuideline);
}
