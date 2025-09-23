/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SnomedController } from './snomed.controller';

describe('SnomedController', () => {
	describe('getAuth', () => {
		it('should return the auth token from the service', async () => {
			const mockToken = { access_token: 'token', expires_in: 3600 };
			const snomedService = {
				getAuthToken: jest.fn().mockResolvedValue(mockToken)
			};
			const controller = new SnomedController(snomedService as any);

			const result = await controller.getAuth();
			expect(result).toEqual(mockToken);
			expect(snomedService.getAuthToken).toHaveBeenCalled();
		});

		it('should propagate errors from the service', async () => {
			const snomedService = {
				getAuthToken: jest.fn().mockRejectedValue(new Error('fail'))
			};
			const controller = new SnomedController(snomedService as any);

			await expect(controller.getAuth()).rejects.toThrow('fail');
		});
	});
});
