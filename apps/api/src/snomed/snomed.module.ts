import { Module } from '@nestjs/common';
import { SnomedService } from './snomed.service';
import { ConfigModule } from '@nestjs/config';
import { SnomedController } from './snomed.controller';

@Module({
	imports: [ConfigModule],
	providers: [SnomedService],
	controllers: [SnomedController]
})
export class SnomedModule {}
