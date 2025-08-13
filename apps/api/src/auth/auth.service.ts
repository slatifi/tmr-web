import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '../generated/prisma/client';
import type { PrismaClient as PrismaClientType } from '../generated/prisma/client';
import { Resend } from 'resend';
import type { Resend as ResendType } from 'resend';

@Injectable()
export class AuthConfigService {
	private prisma: PrismaClientType;
	private resend: ResendType;
	private auth: ReturnType<typeof betterAuth>;

	constructor(private readonly configService: ConfigService) {
		this.prisma = new PrismaClient();
		this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
		this.auth = betterAuth(this.getAuthConfig());
	}

	public getAuthConfig(): BetterAuthOptions {
		return {
			database: prismaAdapter(this.prisma, {
				provider: 'postgresql'
			}),
			trustedOrigins: ['http://localhost:5173'],
			emailAndPassword: {
				enabled: true,
				autoSignIn: false,
				sendResetPassword: async ({ user, url }) => {
					await this.resend.emails.send({
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
	}

	public getAuth(): ReturnType<typeof betterAuth> {
		return this.auth;
	}
}
