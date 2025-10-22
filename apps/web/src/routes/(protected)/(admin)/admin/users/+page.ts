import { authClient } from '$lib/auth';
import type { PageLoad } from './$types';
import type { User } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ url }) => {
	const pageNum = parseInt(url.searchParams.get('page') || '1');

	const res = await authClient.admin.listUsers({
		query: {
			limit: 10,
			offset: (pageNum - 1) * 10
		}
	});

	// Redirect to first page if page number is out of range
	if (res.data && res.data?.total < pageNum * 10 && res.data?.users.length === 0) {
		redirect(302, '/admin/users?page=1');
	}

	return {
		users: (res.data?.users || []) as User[],
		total: res.data?.total || 0,
		currentPage: pageNum,
		meta: {
			title: 'User Management'
		}
	};
};
