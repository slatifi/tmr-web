import { authClient, getSession } from '$lib/auth';
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

	if (user.role !== 'admin') {
		// Admin role may be set by env instead
		const res = await authClient.admin.listUsers({
			query: { searchValue: user.email, searchField: 'email' }
		});
		if (res.data) {
			user.role = 'admin';
			await authClient.admin.updateUser({
				userId: user.id,
				data: { role: 'admin' }
			});
		}
	}

	return {
		session,
		user
	} as { session: Session; user: User };
};
