import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	return {
		registered: url.searchParams.get('registered') === 'true',
		redirect: url.searchParams.get('redirect'),
		request: url.searchParams.get('request') === 'true',
		reset: url.searchParams.get('reset') === 'true',
		reset_error: url.searchParams.get('reset_error') === 'true',
		meta: {
			title: 'Login'
		}
	};
};
