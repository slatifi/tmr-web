import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { RepetitionInteractionRule } from './rules/repetition.rule';
import { InteractionController } from './interaction.controller';
import { GuidelineModule } from '@/cig/guideline/guideline.module';
import { ContradictionInteractionRule } from './rules/contradiction.rule';

@Module({
	imports: [GuidelineModule],
	providers: [InteractionService, RepetitionInteractionRule, ContradictionInteractionRule],
	controllers: [InteractionController]
})
export class InteractionModule {}
