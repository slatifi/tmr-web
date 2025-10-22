import { createAuthClient } from 'better-auth/svelte';
import { adminClient } from 'better-auth/client/plugins';
import { env } from '$env/dynamic/public';

export const auth = createAuthClient({
	baseURL: env.PUBLIC_API_BASE_URL,
	plugins: [adminClient()]
});

export const {
	getSession,
	useSession,
	updateUser,
	changePassword,
	signIn,
	signOut,
	signUp,
	requestPasswordReset,
	resetPassword
} = auth;

export type Session = typeof auth.$Infer.Session;
export type User = (typeof auth.$Infer.Session)['user'];
