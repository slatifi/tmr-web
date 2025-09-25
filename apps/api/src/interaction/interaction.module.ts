import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { InteractionController } from './interaction.controller';
import { GuidelineModule } from '@/cig/guideline/guideline.module';

import { RepetitionInteractionRule } from './rules/repetition.rule';
import { RecommendationContradictionInteractionRule } from './rules/recommendation_contradiction.rule';
import { ContributionContradictionInteractionRule } from './rules/contribution_contradiction.rule';
import { DivergentInteractionRule } from './rules/divergent.rule';
import { AlternativeInteractionRule } from './rules/alternative.rule';
import { RepairableInteractionRule } from './rules/repairable.rule';
import { SideEffectInteractionRule } from './rules/side_effect.rule';

@Module({
	imports: [GuidelineModule],
	providers: [
		InteractionService,
		// Rules
		RepetitionInteractionRule,
		RecommendationContradictionInteractionRule,
		ContributionContradictionInteractionRule,
		DivergentInteractionRule,
		AlternativeInteractionRule,
		RepairableInteractionRule,
		SideEffectInteractionRule
	],
	controllers: [InteractionController]
})
export class InteractionModule {}
