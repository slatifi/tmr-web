import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { DatabaseService } from '@/database/database.service';
import { Guideline } from './entities/guideline.entity';
import { ExpandedGuideline } from './entities/expanded-guideline.entity';

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

	async findAll(userId: string) {
		const guidelines = await this.db.guideline.findMany({
			where: { userId },
			orderBy: {
				createdAt: 'desc'
			}
		});
		return guidelines.map((guideline) => new Guideline(guideline));
	}

	async findOne(id: number, deep: boolean = false) {
		const deepQuery = {
			where: { id },
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

		const guideline = await this.db.guideline.findUnique(deep ? deepQuery : { where: { id } });

		if (!guideline) throw new NotFoundException(`Guideline with ID ${id} not found`);
		return deep ? new ExpandedGuideline(guideline) : new Guideline(guideline);
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
