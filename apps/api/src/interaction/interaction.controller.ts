import { GuidelineService } from '@/cig/guideline/guideline.service';
import { Controller, Get, ParseArrayPipe, Query } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { ExpandedGuideline } from '@/cig/guideline/entities/expanded-guideline.entity';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { InteractionEntity } from './entities/interaction.entity';

@Controller('interaction')
export class InteractionController {
	constructor(
		private readonly interactionService: InteractionService,
		private readonly guidelineService: GuidelineService
	) {}

	@ApiQuery({ name: 'ids', type: Number, description: 'Comma-separated list of guideline IDs' })
	@ApiResponse({ status: 200, description: 'List of interactions', type: InteractionEntity })
	@Get()
	async findAll(
		@Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[],
		@Session() session: UserSession
	) {
		const guidelines: ExpandedGuideline[] = [];
		const userId: string = session?.user?.id;

		for (const id of ids) {
			const guideline = await this.guidelineService.findOne(id, true, userId);
			if (guideline) {
				guidelines.push(guideline as ExpandedGuideline);
			}
		}
		return this.interactionService.findAll(guidelines);
	}
}
