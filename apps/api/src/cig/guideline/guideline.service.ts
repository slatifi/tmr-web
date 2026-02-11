import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { DatabaseService } from '@/database/database.service';
import { Guideline } from './entities/guideline.entity';
import { ExpandedGuideline } from './entities/expanded-guideline.entity';
import { copyGuideline } from './utils';

@Injectable()
export class GuidelineService {
	constructor(private readonly db: DatabaseService) {}

	async create(createGuidelineDto: CreateGuidelineDto, userId: string) {
		const guideline = await this.db.guideline.create({
			data: {
				...createGuidelineDto,
				user: {
					connect: {
						id: userId
					}
				}
			}
		});
		return new Guideline(guideline);
	}

	async findAll(userId: string, mine: boolean = true) {
		const where = mine ? { userId } : { OR: [{ public: true }, { userId }] };
		const guidelines = await this.db.guideline.findMany({
			where,
			orderBy: {
				createdAt: 'desc'
			}
		});
		return guidelines.map((guideline) => new Guideline(guideline));
	}

	async findOne(id: number, deep: boolean = false, userId?: string) {
		if (deep && !userId) throw new BadRequestException('User ID is required for deep fetch');

		const deepQuery = {
			where: { id, OR: [{ public: true }, { userId }] },
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
		};

		if (deep) {
			const guideline = await this.db.guideline.findFirst(deepQuery);
			if (!guideline) throw new NotFoundException(`Guideline with ID ${id} not found`);
			return new ExpandedGuideline(guideline as ExpandedGuideline);
		} else {
			const guideline = await this.db.guideline.findUnique({ where: { id, userId } });
			if (!guideline) throw new NotFoundException(`Guideline with ID ${id} not found`);
			return new Guideline(guideline);
		}
	}

	async copy(id: number, userId: string) {
		return await copyGuideline(this.db, id, userId);
	}

	async update(id: number, updateGuidelineDto: UpdateGuidelineDto) {
		const updatedGuideline = await this.db.guideline.update({
			where: { id },
			data: updateGuidelineDto
		});

		if (!updatedGuideline) throw new NotFoundException(`Guideline with ID ${id} not found`);
		return new Guideline(updatedGuideline);
	}

	async remove(id: number) {
		return await this.db.guideline.delete({
			where: { id }
		});
	}
}
