import { getSession } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
	const session = await getSession();
	const user = session?.data?.user;

	if (user) {
		redirect(303, '/dashboard');
	}
};
