import type { PageLoad } from './$types';
import type { Guideline } from '@repo/shared-types';

export const load: PageLoad = async ({ fetch, depends }) => {
	const guidelines = await fetch('/api/guideline')
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
