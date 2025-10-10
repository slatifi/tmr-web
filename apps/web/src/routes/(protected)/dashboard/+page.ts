import type { Guideline, Recommendation } from '@repo/shared-types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const guidelines: Guideline[] = await fetch('/api/guideline?mine=false')
		.then((res) => res.json())
		.catch((err) => console.error(err));

	const recommendations: Recommendation[] = await fetch('/api/recommendation')
		.then((res) => res.json())
		.catch((err) => console.error(err));

	const { user } = await parent();

	let myGuidelines: Guideline[] = [];
	let publicGuidelines: Guideline[] = [];
	if (guidelines && guidelines.length > 0) {
		myGuidelines = guidelines.filter((g) => g.userId === user.id);
		publicGuidelines = guidelines.filter((g) => g.userId !== user.id);
	}

	return {
		meta: {
			title: 'Dashboard'
		},
		guidelines: myGuidelines || [],
		publicGuidelines: publicGuidelines || [],
		recommendations: recommendations || []
	};
};
