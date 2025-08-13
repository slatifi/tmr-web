import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from './generated/prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();

console.log(process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const authConfig: BetterAuthOptions = {
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	trustedOrigins: ['http://localhost:5173'],
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		sendResetPassword: async ({ user, url }) => {
			await resend.emails.send({
				from: 'TMR-W <no-reply@tmr.slatifi.co.uk>',
				to: user.email,
				subject: 'Reset your password',
				html: `<p>Hi ${user.name},</p>
					<p>Click the link below to reset your password:</p>
					<a href="${url}">Reset Password</a>
					<p>If you did not request this, please ignore this email.</p>
					<p>Thanks,</p>
					<p>TMR Team</p>`
			});
		}
	}
};

export const auth = betterAuth(authConfig) as ReturnType<typeof betterAuth>;
