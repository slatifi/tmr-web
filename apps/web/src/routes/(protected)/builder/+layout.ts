import { fetchWithCredentials } from '$lib/utils';
import type { LayoutLoad } from './$types';
import type { Guideline } from '@repo/shared-types';

export const load: LayoutLoad = async ({ depends }) => {
	const guidelines = await fetchWithCredentials('/api/guideline')
		.then((res) => res.json())
		.catch((err) => console.error(err));

	depends('app:guidelines');

	return {
		meta: {
			title: 'Guideline Builder'
		},
		guidelines: guidelines || []
	} as {
		meta: { title: string };
		guidelines: Guideline[];
	};
};
