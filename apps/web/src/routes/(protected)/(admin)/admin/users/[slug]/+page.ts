import { authClient } from '$lib/auth';
import type { PageLoad } from './$types';
import type { User } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, depends }) => {
	const res = await authClient.admin.listUsers({
		query: {
			searchValue: params.slug,
			searchField: 'email',
			limit: 1
		}
	});

	if (!res.data || res.data.users.length === 0) {
		redirect(302, '/admin/users');
	}

	console.log(res.data.users[0]);

	depends('app:admin-user');

	return {
		user: res.data.users[0] as User,
		meta: {
			title: 'Manage User'
		}
	};
};
