import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
	imports: [DatabaseModule],
	controllers: [ContributionController],
	providers: [ContributionService]
})
export class ContributionModule {}
