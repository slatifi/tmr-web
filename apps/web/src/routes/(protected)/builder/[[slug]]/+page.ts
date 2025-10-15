import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { GuidelineWithRelations } from '@repo/shared-types';
import { getSnomedNames } from '$lib/stores/SnomedStore.svelte';
import { fetchWithCredentials } from '$lib/utils';

export const load: PageLoad = async ({ depends, params }) => {
	let guideline: GuidelineWithRelations | null = null;

	let snomedDisplayMap: Map<string, string> = new Map();
	if (params.slug) {
		try {
			const res = await fetchWithCredentials(`/api/guideline/deep/${params.slug}`);
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

	// Pre-fetch SNOMED display names for all codes in the guideline
	if (guideline) {
		const snomedCodes = new Set<string>();
		for (const rec of guideline.recommendations) {
			snomedCodes.add(rec.action); // Recommendation action code
			rec.contributions.forEach(
				(c) => c.transition?.property && snomedCodes.add(c.transition.property)
			); // Contribution transition property code
		}
		snomedDisplayMap = await getSnomedNames(Array.from(snomedCodes));
	}

	depends('app:guideline');

	return {
		guideline,
		snomedDisplayMap
	};
};
