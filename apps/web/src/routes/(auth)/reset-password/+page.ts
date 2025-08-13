import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	// Extract the token and error from the URL search parameters
	const token = url.searchParams.get('token');
	const error = url.searchParams.get('error');

	if (!token && error) {
		throw redirect(303, '/login?reset_error=true');
	} else if (!token && !error) {
		throw redirect(303, '/login?reset_error=true');
	}

	return {
		token: token || '',
		meta: {
			title: 'Reset Password'
		}
	};
};
