import { fetchWithCredentials } from '$lib/utils';
import type { PageLoad } from './$types';
import type { Guideline } from '@repo/shared-types';

export const load: PageLoad = async ({ depends }) => {
	const guidelines = await fetchWithCredentials('/api/guideline?mine=false')
		.then((res) => res.json())
		.catch((err) => console.error(err));

	depends('app:guidelines');

	return {
		meta: {
			title: 'Interaction Detection'
		},
		guidelines: guidelines || []
	} as {
		meta: { title: string };
		guidelines: Guideline[];
	};
};
