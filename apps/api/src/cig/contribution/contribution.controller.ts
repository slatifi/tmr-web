import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { ResourceOwnership } from '@/common/guards/resource-ownership.guard';

@Controller('contribution')
export class ContributionController {
	constructor(private readonly contributionService: ContributionService) {}

	@Post()
	@ResourceOwnership({
		resourceType: 'recommendation',
		idParam: 'recommendationId',
		nested: ['guideline']
	})
	create(@Body() createContributionDto: CreateContributionDto) {
		return this.contributionService.create(createContributionDto);
	}

	@Get('all/:recommendationId')
	@ResourceOwnership({
		resourceType: 'recommendation',
		idParam: 'recommendationId',
		nested: ['guideline']
	})
	findAll(@Param('recommendationId', ParseIntPipe) recommendationId: number) {
		return this.contributionService.findAll(recommendationId);
	}

	@Get(':id')
	@ResourceOwnership({
		resourceType: 'contribution',
		nested: ['recommendation', 'guideline']
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.contributionService.findOne(id);
	}

	@Patch(':id')
	@ResourceOwnership([
		{ resourceType: 'contribution', nested: ['recommendation', 'guideline'] },
		{ resourceType: 'recommendation', idParam: 'recommendationId', nested: ['guideline'] }
	])
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateContributionDto: UpdateContributionDto
	) {
		return this.contributionService.update(id, updateContributionDto);
	}

	@Delete(':id')
	@ResourceOwnership({
		resourceType: 'contribution',
		nested: ['recommendation', 'guideline']
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.contributionService.remove(id);
	}
}
