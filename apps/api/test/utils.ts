import { DatabaseService } from '@/database/database.service';
import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export function createMockDatabaseService() {
	return {
		provide: DatabaseService,
		useValue: mockDeep<PrismaClient>()
	} as { provide: typeof DatabaseService; useValue: DeepMockProxy<PrismaClient> };
}
