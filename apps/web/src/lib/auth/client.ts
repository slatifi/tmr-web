import { createAuthClient } from 'better-auth/svelte';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const auth = createAuthClient({
	baseURL: PUBLIC_API_BASE_URL
});

export const { getSession, useSession, signIn, signOut, signUp } = auth;
