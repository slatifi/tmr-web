import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SnomedService {
	constructor(private configService: ConfigService) {}

	async getAuthToken(): Promise<{ access_token: string; expires_in: number }> {
		const res = await fetch(this.configService.get('SNOMED_AUTH_URL') as string, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				grant_type: 'client_credentials',
				client_id: this.configService.get('SNOMED_CLIENT_ID') as string,
				client_secret: this.configService.get('SNOMED_CLIENT_SECRET') as string
			})
		});

		if (!res.ok) {
			throw new Error(`Failed to fetch SNOMED auth token: ${res.statusText}`);
		}

		const data = await res.json();
		return {
			access_token: data.access_token,
			expires_in: data.expires_in
		};
	}
}
