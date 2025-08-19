import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { DatabaseService } from '@/database/database.service';
import { Contribution } from './entities/contribution.entity';

@Injectable()
export class ContributionService {
	constructor(private readonly db: DatabaseService) {}

	async create(createContributionDto: CreateContributionDto) {
		const contribution = await this.db.contribution.create({
			data: createContributionDto
		});
		return new Contribution(contribution);
	}

	async findAll(recommendationId: number) {
		const contributions = await this.db.contribution.findMany({
			where: { recommendationId },
			orderBy: { createdAt: 'desc' }
		});
		return contributions.map((contribution) => new Contribution(contribution));
	}

	async findOne(id: number) {
		const contribution = await this.db.contribution.findUnique({
			where: { id }
		});

		if (!contribution) throw new NotFoundException(`Contribution with ID ${id} not found`);
		return new Contribution(contribution);
	}

	async update(id: number, updateContributionDto: UpdateContributionDto) {
		const updatedContribution = await this.db.contribution.update({
			where: { id },
			data: updateContributionDto
		});

		if (!updatedContribution) throw new NotFoundException(`Contribution with ID ${id} not found`);
		return new Contribution(updatedContribution);
	}

	async remove(id: number) {
		return await this.db.contribution.delete({
			where: { id }
		});
	}
}
