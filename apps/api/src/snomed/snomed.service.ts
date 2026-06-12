import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNOMEDSubsumes } from './snomed.interface';
import Database from 'better-sqlite3';

type SnomedSubsumesKey = `${string}|${string}`;

@Injectable()
export class SnomedService implements OnModuleInit {
	private readonly logger = new Logger(SnomedService.name);
	private authToken: string | null = null;
	private subsumesCache: Map<SnomedSubsumesKey, SNOMEDSubsumes> = new Map();
	private tcDb: Database.Database | null = null;

	constructor(private configService: ConfigService) {}

	onModuleInit() {
		const dbPath = this.configService.get<string>('SNOMED_TC_DB_PATH');
		if (dbPath) {
			try {
				this.tcDb = new Database(dbPath, { readonly: true });
				this.logger.log(`Using local transitive closure DB: ${dbPath}`);
			} catch (error) {
				this.logger.error(`Failed to load transitive closure DB from ${dbPath}: ${error}`);
				this.tcDb = null;
			}
		}
	}

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

	private getCacheKey(codeA: string, codeB: string): SnomedSubsumesKey {
		return `${codeA}|${codeB}`;
	}

	async subsumes(codeA: string, codeB: string): Promise<SNOMEDSubsumes> {
		const cacheValue = this.subsumesCache.get(this.getCacheKey(codeA, codeB));
		if (cacheValue) return cacheValue;
		const value = this.tcDb
			? this.subsumesFromDb(codeA, codeB)
			: await this.subsumesFromTerminologyServer(codeA, codeB);

		this.addToCache(this.getCacheKey(codeA, codeB), value);
		return value;
	}

	private subsumesFromDb(codeA: string, codeB: string): SNOMEDSubsumes {
		if (codeA === codeB) return SNOMEDSubsumes.EQUIVALENT;

		const db = this.tcDb!;
		const aSubsumesB = db
			.prepare('SELECT 1 FROM transitive_closure WHERE child = ? AND ancestor = ? LIMIT 1')
			.get(codeB, codeA);
		if (aSubsumesB) return SNOMEDSubsumes.SUBSUMES;

		const aSubsumedBy = db
			.prepare('SELECT 1 FROM transitive_closure WHERE child = ? AND ancestor = ? LIMIT 1')
			.get(codeA, codeB);
		if (aSubsumedBy) return SNOMEDSubsumes.SUMSUMED_BY;

		return SNOMEDSubsumes.NONE;
	}

	private async subsumesFromTerminologyServer(
		codeA: string,
		codeB: string
	): Promise<SNOMEDSubsumes> {
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
		return data.parameter[0].valueCode as SNOMEDSubsumes;
	}

	private addToCache(key: SnomedSubsumesKey, value: SNOMEDSubsumes) {
		if (this.subsumesCache.size >= 1000) {
			// Simple cache eviction: remove the first inserted item
			const firstKey = this.subsumesCache.keys().next().value;
			if (firstKey) this.subsumesCache.delete(firstKey);
		}
		this.subsumesCache.set(key, value);
	}
}
