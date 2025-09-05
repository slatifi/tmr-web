import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { GuidelineWithRelations } from '@repo/shared-types';

export const load: PageLoad = async ({ fetch, depends, params }) => {
	let guideline = null;
	if (params.slug) {
		try {
			const res = await fetch(`/api/guideline/deep/${params.slug}`);
			if (res.ok) {
				guideline = await res.json();
			} else if (res.status === 404) {
				redirect(302, '/builder');
			}
		} catch (err) {
			console.error(err);
		} finally {
			if (!guideline) {
				redirect(302, '/builder');
			}
		}
	}

	depends('app:guideline');

	return {
		guideline
	} as {
		guideline: GuidelineWithRelations | null;
	};
};
