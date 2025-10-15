import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { env } from '$env/dynamic/public';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export async function fetchWithCredentials(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<Response> {
	if (typeof input === 'string' && !input.startsWith('http') && input.startsWith('/api')) {
		input = env.PUBLIC_API_BASE_URL + input;
	}

	return fetch(input, {
		...init,
		credentials: 'include'
	});
}
