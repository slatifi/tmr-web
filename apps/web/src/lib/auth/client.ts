import { createAuthClient } from 'better-auth/svelte';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const auth = createAuthClient({
	baseURL: PUBLIC_API_BASE_URL
});

export const {
	getSession,
	useSession,
	signIn,
	signOut,
	signUp,
	requestPasswordReset,
	resetPassword
} = auth;

export type Session = typeof auth.$Infer.Session;
export type User = (typeof auth.$Infer.Session)['user'];
