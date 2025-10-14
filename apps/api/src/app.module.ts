import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { AuthModule, AuthGuard } from '@thallesp/nestjs-better-auth';
import { authAsyncFactory } from './auth';

import { DatabaseModule } from './database/database.module';
import { CigModule } from './cig/cig.module';
import { SnomedModule } from './snomed/snomed.module';
import { InteractionModule } from './interaction/interaction.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		AuthModule.forRootAsync(authAsyncFactory),
		DatabaseModule,
		CigModule,
		SnomedModule,
		InteractionModule
	],
	controllers: [AppController],
	providers: [AppService, { provide: 'APP_GUARD', useClass: AuthGuard }]
})
export class AppModule {}
