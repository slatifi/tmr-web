import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

export const authAsyncFactory = {
	inject: [ConfigService],
	useFactory: (configService: ConfigService): { auth: ReturnType<typeof betterAuth> } => {
		const prisma = new PrismaClient();

		const resend = new Resend(configService.get<string>('RESEND_API_KEY'));
		const sendEmail = configService.get<string>('SEND_EMAIL');

		const trustedOrigins = configService.get<string>('TRUSTED_ORIGINS')?.split(',') ?? [
			'http://localhost:5173'
		];

		const options: BetterAuthOptions = {
			database: prismaAdapter(prisma, {
				provider: 'postgresql'
			}),
			trustedOrigins,
			emailAndPassword: {
				enabled: true,
				autoSignIn: false,
				sendResetPassword: async ({ user, url }) => {
					await resend.emails.send({
						from: `TMR-W <${sendEmail}>`,
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

		return {
			auth: betterAuth(options)
		};
	}
};
