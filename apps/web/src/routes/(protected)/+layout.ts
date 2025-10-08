import { getSession } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { Session, User } from '$lib/auth';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, depends }) => {
	const session: Session | null = await getSession().then((res) => res.data);
	const user: User | undefined = session?.user;

	depends('app:user');

	if (!session || !user) {
		redirect(302, '/login?redirect=' + encodeURIComponent(url.pathname));
	}

	return {
		session,
		user
	} as { session: Session; user: User };
};
