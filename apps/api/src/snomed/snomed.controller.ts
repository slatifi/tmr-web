import { Controller, Get } from '@nestjs/common';
import { SnomedService } from './snomed.service';

@Controller('snomed')
export class SnomedController {
	constructor(private readonly snomedService: SnomedService) {}

	@Get('auth')
	getAuth() {
		return this.snomedService.getAuthToken();
	}
}
