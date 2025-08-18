import { Module } from '@nestjs/common';
import { GuidelineService } from './guideline.service';
import { GuidelineController } from './guideline.controller';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { DatabaseModule } from '@/database/database.module';

@Module({
	imports: [AuthModule, DatabaseModule],
	controllers: [GuidelineController],
	providers: [GuidelineService]
})
export class GuidelineModule {}
