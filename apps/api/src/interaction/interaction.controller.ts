import { GuidelineService } from '@/cig/guideline/guideline.service';
import { Controller, Get } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { ExpandedGuideline } from '@/cig/guideline/entities/expanded-guideline.entity';

@Controller('interaction')
export class InteractionController {
	constructor(
		private readonly interactionService: InteractionService,
		private readonly guidelineService: GuidelineService
	) {}

	@Get()
	async findAll() {
		const guidelines = await this.guidelineService.findOne(11, true);
		return this.interactionService.findAll([guidelines as ExpandedGuideline]);
	}
}
