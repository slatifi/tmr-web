import { getSession } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
	const session = await getSession();
	const user = session?.data?.user;
	console.log(url.pathname);

	if (!session || !user) {
		redirect(302, '/login?redirect=' + encodeURIComponent(url.pathname));
	}

	return {
		session,
		user
	};
};
