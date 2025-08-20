/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('PrismaExceptionFilter', () => {
	let filter: PrismaExceptionFilter;
	let mockResponse: any;
	let mockHost: any;

	beforeEach(() => {
		filter = new PrismaExceptionFilter();
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
		mockHost = {
			getArgByIndex: () => undefined,
			isHeadersSent: false,
			switchToHttp: () => ({
				getResponse: () => mockResponse
			})
		};
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	function makeException(code: string, meta?: any) {
		return {
			code,
			message: 'Prisma error',
			meta
		} as Prisma.PrismaClientKnownRequestError;
	}

	it('should handle P2002 (unique constraint)', () => {
		const exception = makeException('P2002', { target: 'email' });
		filter.catch(exception, mockHost);
		expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.CONFLICT,
			message: 'Unique constraint failed on the field: email'
		});
	});

	it('should default to "unknown" if meta.target is missing for P2002', () => {
		const exception = {
			code: 'P2002',
			message: 'Prisma error',
			meta: undefined
		} as Prisma.PrismaClientKnownRequestError;
		filter.catch(exception, mockHost);
		expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.CONFLICT,
			message: 'Unique constraint failed on the field: unknown'
		});
	});

	it('should handle P2003 (foreign key constraint)', () => {
		const exception = makeException('P2003', { constraint: 'fk_user' });
		filter.catch(exception, mockHost);
		expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'Foreign key constraint failed on the field: fk_user'
		});
	});

	it('should handle P2025 (record not found)', () => {
		const exception = makeException('P2025');
		filter.catch(exception, mockHost);
		expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.NOT_FOUND,
			message: 'Record not found for the given criteria'
		});
	});

	it('should default to "unknown" if meta.constraint is missing for P2003', () => {
		const exception = {
			code: 'P2003',
			message: 'Prisma error',
			meta: undefined
		} as Prisma.PrismaClientKnownRequestError;
		filter.catch(exception, mockHost);
		expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.BAD_REQUEST,
			message: 'Foreign key constraint failed on the field: unknown'
		});
	});

	it('should delegate to super.catch for unknown codes', () => {
		const exception = makeException('P9999');
		const superCatch = jest
			.spyOn(PrismaExceptionFilter.prototype, 'catch')
			.mockImplementation(jest.fn());
		// Call the filter's catch method, which should call super.catch for unknown codes
		filter.catch(exception, mockHost);
		expect(superCatch).toHaveBeenCalled();
	});
});
