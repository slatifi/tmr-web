import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { DatabaseService } from '@/database/database.service';
import { Guideline } from './entities/guideline.entity';

@Injectable()
export class GuidelineService {
	constructor(private db: DatabaseService) {}

	async create(createGuidelineDto: CreateGuidelineDto, userId: string) {
		return this.db.guideline.create({
			data: {
				...createGuidelineDto,
				user: {
					connect: {
						id: userId
					}
				}
			}
		});
	}

	async findAll(userId: string) {
		const guidelines = await this.db.guideline.findMany({
			where: {
				userId: userId
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
		return guidelines.map((guideline) => new Guideline(guideline));
	}

	async findOne(id: number) {
		const guideline = await this.db.guideline.findUnique({
			where: {
				id: id
			}
		});

		if (!guideline) {
			throw new NotFoundException(`Guideline with ID ${id} not found`);
		}

		return new Guideline(guideline);
	}

	async update(id: number, updateGuidelineDto: UpdateGuidelineDto) {
		const existingGuideline = await this.db.guideline.findUnique({
			where: { id }
		});

		if (!existingGuideline) {
			throw new NotFoundException(`Guideline with ID ${id} not found`);
		}

		const updatedGuideline = await this.db.guideline.update({
			where: { id },
			data: updateGuidelineDto
		});
		return new Guideline(updatedGuideline);
	}

	async remove(id: number) {
		return this.db.guideline.delete({
			where: { id }
		});
	}
}
