import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { user } = await parent();

	// Check if user has admin role
	if (user.role !== 'admin') {
		redirect(302, '/dashboard');
	}

	return {
		meta: {
			title: 'Admin Panel'
		}
	};
};
