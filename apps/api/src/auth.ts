import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient();

const authConfig: BetterAuthOptions = {
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	trustedOrigins: ['http://localhost:5173'],
	emailAndPassword: { enabled: true, autoSignIn: false }
};

export const auth = betterAuth(authConfig) as ReturnType<typeof betterAuth>;
