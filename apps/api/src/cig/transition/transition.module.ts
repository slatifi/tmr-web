import { Module } from '@nestjs/common';
import { TransitionService } from './transition.service';
import { TransitionController } from './transition.controller';
import { DatabaseModule } from '@/database/database.module';

@Module({
	imports: [DatabaseModule],
	controllers: [TransitionController],
	providers: [TransitionService]
})
export class TransitionModule {}
