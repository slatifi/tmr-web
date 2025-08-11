import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient();

const authConfig: BetterAuthOptions = {
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	emailAndPassword: { enabled: true }
};

export const auth = betterAuth(authConfig) as ReturnType<typeof betterAuth>;
