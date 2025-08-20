/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { ResourceOwnershipGuard } from './resource-ownership.guard';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { createMockDatabaseService } from 'test/utils';
import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client/extension';

describe('ResourceOwnershipGuard', () => {
	let guard: ResourceOwnershipGuard;
	let reflector: jest.Mocked<Reflector>;
	let db: DeepMockProxy<PrismaClient>;
	let context: any;

	beforeEach(() => {
		reflector = { get: jest.fn() } as any;
		db = createMockDatabaseService().useValue;
		guard = new ResourceOwnershipGuard(reflector, db);

		context = {
			switchToHttp: jest.fn().mockReturnThis(),
			getRequest: jest.fn(),
			getHandler: jest.fn()
		};
		mockReset(db);
	});

	function mockRequest({ userId = 'user-1', id = 1, body = {}, params = {} } = {}) {
		return {
			session: { user: { id: userId } },
			params: { id, ...params },
			body
		};
	}

	it('should allow if no checks are defined', async () => {
		reflector.get.mockReturnValue(undefined);
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should allow if checks array is empty', async () => {
		reflector.get.mockReturnValue([]);
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should skip check if resourceType is missing', async () => {
		reflector.get.mockReturnValue([{ idParam: 'id' }]);
		context.getRequest.mockReturnValue(mockRequest());
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should skip check if userId is missing', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline' }]);
		context.getRequest.mockReturnValue(mockRequest({ userId: undefined }));
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should skip check if resourceId is invalid', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline' }]);
		// @ts-expect-error - Mocking false request
		context.getRequest.mockReturnValue(mockRequest({ id: 'not-a-number' }));
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should allow if guideline does not exist', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline' }]);
		context.getRequest.mockReturnValue(mockRequest());
		db.guideline.findUnique.mockResolvedValue(null);
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should throw ForbiddenException if user does not own guideline', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline' }]);
		context.getRequest.mockReturnValue(mockRequest());
		db.guideline.findUnique.mockResolvedValue({ userId: 'other-user' });
		await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
	});

	it('should allow if user owns guideline', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline' }]);
		context.getRequest.mockReturnValue(mockRequest());
		db.guideline.findUnique.mockResolvedValue({ userId: 'user-1' });
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should check nested ownership and allow if user owns nested resource', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline', nested: ['nestedResource'] }]);
		context.getRequest.mockReturnValue(mockRequest());
		db.guideline.findUnique.mockResolvedValue({
			nestedResource: { userId: 'user-1' }
		});
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should throw ForbiddenException if user does not own nested resource', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline', nested: ['nestedResource'] }]);
		context.getRequest.mockReturnValue(mockRequest());
		db.guideline.findUnique.mockResolvedValue({
			nestedResource: { userId: 'other-user' }
		});
		await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
	});

	it('should skip check if nested resource is missing', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline', nested: ['nestedResource'] }]);
		context.getRequest.mockReturnValue(mockRequest());
		db.guideline.findUnique.mockResolvedValue({
			nestedResource: null
		});
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should use id from body if not in params', async () => {
		reflector.get.mockReturnValue([{ resourceType: 'guideline', idParam: 'guidelineId' }]);
		context.getRequest.mockReturnValue(mockRequest({ params: {}, body: { guidelineId: 2 } }));
		db.guideline.findUnique.mockResolvedValue({ userId: 'user-1' });
		expect(await guard.canActivate(context)).toBe(true);
	});

	it('should handle multiple checks and throw if any check fails', async () => {
		reflector.get.mockReturnValue([
			{ resourceType: 'guideline', idParam: 'id' },
			{ resourceType: 'guideline', idParam: 'otherId' }
		]);
		context.getRequest.mockReturnValue(mockRequest({ params: { id: 1, otherId: 2 } }));
		db.guideline.findUnique
			.mockResolvedValueOnce({ userId: 'user-1' }) // first check passes
			.mockResolvedValueOnce({ userId: 'other-user' }); // second check fails
		await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
	});

	it('should handle multiple checks and allow if all checks pass', async () => {
		reflector.get.mockReturnValue([
			{ resourceType: 'guideline', idParam: 'id' },
			{ resourceType: 'guideline', idParam: 'otherId' }
		]);
		context.getRequest.mockReturnValue(mockRequest({ params: { id: 1, otherId: 2 } }));
		db.guideline.findUnique
			.mockResolvedValueOnce({ userId: 'user-1' })
			.mockResolvedValueOnce({ userId: 'user-1' });
		expect(await guard.canActivate(context)).toBe(true);
	});
});
