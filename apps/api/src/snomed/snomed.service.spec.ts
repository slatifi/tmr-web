import { Test, TestingModule } from '@nestjs/testing';
import { SnomedService } from './snomed.service';
import { ConfigService } from '@nestjs/config';

describe('SnomedService', () => {
	let service: SnomedService;
	let configService: ConfigService;

	beforeEach(async () => {
		configService = {
			get: jest.fn((key: string) => {
				switch (key) {
					case 'SNOMED_AUTH_URL':
						return 'https://example.com/auth';
					case 'SNOMED_CLIENT_ID':
						return 'test-client-id';
					case 'SNOMED_CLIENT_SECRET':
						return 'test-client-secret';
					default:
						return null;
				}
			})
		} as any;

		const module: TestingModule = await Test.createTestingModule({
			providers: [SnomedService, { provide: ConfigService, useValue: configService }]
		}).compile();

		service = module.get<SnomedService>(SnomedService);

		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({
				access_token: 'mocked-access-token',
				expires_in: 3600
			})
		});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should fetch and return the access token and expiry', async () => {
		const result = await service.getAuthToken();
		expect(result).toEqual({
			access_token: 'mocked-access-token',
			expires_in: 3600
		});
		expect(fetch).toHaveBeenCalledWith(
			'https://example.com/auth',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			})
		);
	});

	it('should throw an error if fetch fails', async () => {
		(fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			statusText: 'Unauthorized',
			json: jest.fn()
		});

		await expect(service.getAuthToken()).rejects.toThrow(
			'Failed to fetch SNOMED auth token: Unauthorized'
		);
	});
});
