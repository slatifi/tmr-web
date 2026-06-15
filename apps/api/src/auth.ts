import { betterAuth, BetterAuthOptions } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { admin } from 'better-auth/plugins';
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

		const adminUserIds = configService.get<string>('ADMIN_USER_IDS')?.split(',') ?? [];

		const requireEmailVerification =
			configService.get<string>('REQUIRE_EMAIL_VERIFICATION') === 'true' ||
			configService.get<string>('REQUIRE_EMAIL_VERIFICATION') === undefined;

		const options: BetterAuthOptions = {
			database: prismaAdapter(prisma, {
				provider: 'postgresql'
			}),
			trustedOrigins,
			plugins: [admin({ adminUserIds })],
			emailVerification: {
				sendOnSignUp: requireEmailVerification,
				autoSignInAfterVerification: true,
				sendVerificationEmail: async ({ user, url }) => {
					await resend.emails.send({
						from: `TMR-W <${sendEmail}>`,
						to: user.email,
						subject: 'Verify your email',
						html: `<p>Hi ${user.name},</p>
					<p>Click the link below to verify your email address:</p>
					<a href="${url}">Verify Email</a>
					<p>If you did not create an account, please ignore this email.</p>
					<p>Thanks,</p>
					<p>TMR Team</p>`
					});
				}
			},
			emailAndPassword: {
				enabled: true,
				autoSignIn: false,
				requireEmailVerification,
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
			},
			hooks: {
				after: createAuthMiddleware(async (ctx) => {
					const user = ctx.context?.newSession?.user || '';

					if (user && user.role !== 'admin' && adminUserIds.includes(user.id)) {
						await prisma.user.update({
							where: { id: user.id },
							data: { role: 'admin' }
						});
						console.log(`Updated user ${user.id} to admin role`);
					}
				})
			}
		};

		return {
			auth: betterAuth(options)
		};
	}
};
