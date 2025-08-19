import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { DatabaseService } from '@/database/database.service';
import { Recommendation } from './entities/recommendation.entity';

@Injectable()
export class RecommendationService {
	constructor(private readonly db: DatabaseService) {}

	async create(createRecommendationDto: CreateRecommendationDto) {
		const recommendation = await this.db.recommendation.create({
			data: createRecommendationDto
		});
		return new Recommendation(recommendation);
	}

	async findAll(guidelineId: number) {
		const recommendations = await this.db.recommendation.findMany({
			where: { guidelineId },
			orderBy: { createdAt: 'desc' }
		});
		return recommendations.map((rec) => new Recommendation(rec));
	}

	async findOne(id: number) {
		const recommendation = await this.db.recommendation.findUnique({
			where: { id }
		});

		if (!recommendation) throw new NotFoundException(`Recommendation with ID ${id} not found`);
		return new Recommendation(recommendation);
	}

	async update(id: number, updateRecommendationDto: UpdateRecommendationDto) {
		const recommendation = await this.db.recommendation.update({
			where: { id },
			data: updateRecommendationDto
		});

		if (!recommendation) throw new NotFoundException(`Recommendation with ID ${id} not found`);
		return new Recommendation(recommendation);
	}

	async remove(id: number) {
		return await this.db.recommendation.delete({
			where: { id }
		});
	}
}
