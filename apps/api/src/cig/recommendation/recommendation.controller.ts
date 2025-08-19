import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { ResourceOwnership } from '@/common/guards/resource-ownership.guard';

@Controller('recommendation')
export class RecommendationController {
	constructor(private readonly recommendationService: RecommendationService) {}

	@Post()
	@ResourceOwnership({ resourceType: 'guideline', idParam: 'guidelineId' })
	create(@Body() createRecommendationDto: CreateRecommendationDto) {
		return this.recommendationService.create(createRecommendationDto);
	}

	@Get('all/:guidelineId')
	@ResourceOwnership({ resourceType: 'guideline', idParam: 'guidelineId' })
	findAll(@Param('guidelineId', ParseIntPipe) guidelineId: number) {
		return this.recommendationService.findAll(guidelineId);
	}

	@Get(':id')
	@ResourceOwnership({ resourceType: 'recommendation', nested: ['guideline'] })
	findOne(@Param('id', ParseIntPipe, ParseIntPipe) id: number) {
		return this.recommendationService.findOne(id);
	}

	@Patch(':id')
	@ResourceOwnership([
		{ resourceType: 'recommendation', nested: ['guideline'] },
		{ resourceType: 'guideline', idParam: 'guidelineId' }
	])
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateRecommendationDto: UpdateRecommendationDto
	) {
		return this.recommendationService.update(id, updateRecommendationDto);
	}

	@Delete(':id')
	@ResourceOwnership({ resourceType: 'recommendation', nested: ['guideline'] })
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.recommendationService.remove(id);
	}
}
