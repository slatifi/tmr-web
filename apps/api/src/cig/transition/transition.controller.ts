import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TransitionService } from './transition.service';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';
import { ResourceOwnership } from '@/common/guards/resource-ownership.guard';

@Controller('transition')
export class TransitionController {
	constructor(private readonly transitionService: TransitionService) {}

	@Post()
	@ResourceOwnership({
		resourceType: 'contribution',
		idParam: 'contributionId',
		nested: ['recommendation', 'guideline']
	})
	create(@Body() createTransitionDto: CreateTransitionDto) {
		return this.transitionService.create(createTransitionDto);
	}

	@Get('all/:contributionId')
	@ResourceOwnership({
		resourceType: 'contribution',
		idParam: 'contributionId',
		nested: ['recommendation', 'guideline']
	})
	findAll(@Param('contributionId', ParseIntPipe) contributionId: number) {
		return this.transitionService.findAll(contributionId);
	}

	@Get(':id')
	@ResourceOwnership({
		resourceType: 'transition',
		nested: ['contribution', 'recommendation', 'guideline']
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.transitionService.findOne(id);
	}

	@Patch(':id')
	@ResourceOwnership([
		{ resourceType: 'transition', nested: ['contribution', 'recommendation', 'guideline'] },
		{
			resourceType: 'contribution',
			idParam: 'contributionId',
			nested: ['recommendation', 'guideline']
		}
	])
	update(@Param('id', ParseIntPipe) id: number, @Body() updateTransitionDto: UpdateTransitionDto) {
		return this.transitionService.update(id, updateTransitionDto);
	}

	@Delete(':id')
	@ResourceOwnership({
		resourceType: 'transition',
		nested: ['contribution', 'recommendation', 'guideline']
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.transitionService.remove(id);
	}
}
