import { Module } from '@nestjs/common';
import { GuidelineModule } from './guideline/guideline.module';

@Module({
	imports: [GuidelineModule]
})
export class CigModule {}
