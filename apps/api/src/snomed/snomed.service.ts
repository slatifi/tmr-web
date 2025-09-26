import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNOMEDSubsumes } from './snomed.interface';

@Injectable()
export class SnomedService {
	private authToken: string | null = null;
	private submusesCache: Map<Record<string, string>, SNOMEDSubsumes> = new Map();

	constructor(private configService: ConfigService) {}

	async ensureAuthToken(): Promise<void> {
		if (this.authToken) return;
		const tokenData = await this.getAuthToken();
		this.authToken = tokenData.access_token;
		// Set a timeout to clear the token before it expires (subtracting 1 minute for safety)
		setTimeout(
			() => {
				this.authToken = null;
			},
			(tokenData.expires_in - 60) * 1000
		);
	}

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

	async subsumes(codeA: string, codeB: string): Promise<SNOMEDSubsumes> {
		// Check cache first
		const cacheValue = this.submusesCache.get({ codeA, codeB });
		if (cacheValue) return cacheValue;

		const url = new URL(
			(this.configService.get('SNOMED_BASE_URL') as string) + '/CodeSystem/$subsumes'
		);
		url.searchParams.append('system', 'http://snomed.info/sct');
		url.searchParams.append('codeA', codeA);
		url.searchParams.append('codeB', codeB);
		await this.ensureAuthToken();

		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${this.authToken}`
			}
		});

		if (!res.ok) {
			throw new Error(`Failed to fetch SNOMED subsumption: ${res.statusText}`);
		}

		const data = await res.json();
		const value = data.parameter[0].valueCode as SNOMEDSubsumes;

		this.addToCache({ codeA, codeB }, value);
		return value;
	}

	private addToCache(key: Record<string, string>, value: SNOMEDSubsumes) {
		if (this.submusesCache.size >= 1000) {
			// Simple cache eviction: remove the first inserted item
			const firstKey = this.submusesCache.keys().next().value;
			if (firstKey) this.submusesCache.delete(firstKey);
		}
		this.submusesCache.set(key, value);
	}
}
