export const load = async ({ url }) => {
	return {
		registered: url.searchParams.get('registered') === 'true',
		redirect: url.searchParams.get('redirect'),
		meta: {
			title: 'Login'
		}
	};
};
