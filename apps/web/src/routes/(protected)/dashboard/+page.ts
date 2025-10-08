import type { Guideline, Recommendation } from '@repo/shared-types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const guidelines: Guideline[] = await fetch('/api/guideline')
		.then((res) => res.json())
		.catch((err) => console.error(err));

	const recommendations: Recommendation[] = await fetch('/api/recommendation')
		.then((res) => res.json())
		.catch((err) => console.error(err));

	return {
		meta: {
			title: 'Dashboard'
		},
		guidelines: guidelines || [],
		recommendations: recommendations || []
	};
};
