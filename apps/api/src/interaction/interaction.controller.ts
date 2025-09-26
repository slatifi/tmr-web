import { GuidelineService } from '@/cig/guideline/guideline.service';
import { Controller, Get, ParseArrayPipe, Query } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { ExpandedGuideline } from '@/cig/guideline/entities/expanded-guideline.entity';
import { Session } from '@thallesp/nestjs-better-auth';

@Controller('interaction')
export class InteractionController {
	constructor(
		private readonly interactionService: InteractionService,
		private readonly guidelineService: GuidelineService
	) {}

	@Get()
	async findAll(
		@Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[],
		@Session() session
	) {
		const guidelines: ExpandedGuideline[] = [];
		const userId = session?.user?.id;

		for (const id of ids) {
			const guideline = await this.guidelineService.findOne(id, true);
			if (guideline && guideline.userId === userId) {
				guidelines.push(guideline as ExpandedGuideline);
			}
		}
		return this.interactionService.findAll(guidelines);
	}
}
