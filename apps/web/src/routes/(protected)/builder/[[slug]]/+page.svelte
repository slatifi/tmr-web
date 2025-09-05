<script lang="ts">
	import type { PageProps } from './$types';
	import SelectGuideline from '$lib/components/guideline/SelectGuideline.svelte';
	import GuidelineToolbar from '$lib/components/guideline/GuidelineToolbar.svelte';
	import { goto } from '$app/navigation';
	import GuidelineRecommendation from '$lib/components/guideline/GuidelineRecommendation.svelte';

	const { data }: PageProps = $props();

	let selectedGuideline = $state('');
	let selectedRecommendation = $state<number | null>(null);

	let recommendation = $derived.by(() => {
		return data?.guideline?.recommendations.find((r) => r.id === selectedRecommendation) || null;
	});

	$effect(() => {
		// If no guideline is selected, but there is one in the data, select it
		if (!selectedGuideline && data.guideline) {
			selectedGuideline = data.guideline.id.toString();
		}
	});

	$effect(() => {
		// If a guideline is selected, but it's different from the current one, navigate to it
		if (
			selectedGuideline &&
			data.guideline?.id.toString() !== selectedGuideline &&
			data?.guidelines?.some((g) => g.id.toString() === selectedGuideline)
		) {
			goto(`/builder/${selectedGuideline}`);
		}
	});

	let toolbarRef: HTMLDivElement | null = $state(null);

	const leftColumnRecs = $derived.by(() => {
		return data?.guideline?.recommendations.filter((_, i) => i % 2 === 0) || [];
	});
	const rightColumnRecs = $derived.by(() => {
		return data?.guideline?.recommendations.filter((_, i) => i % 2 === 1) || [];
	});
</script>

<div
	class="relative h-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
>
	<SelectGuideline bind:selectedGuideline guidelines={data?.guidelines} />
	<GuidelineToolbar
		guideline={data.guideline}
		bind:ref={toolbarRef}
		bind:recommendationId={selectedRecommendation}
		{recommendation}
	/>
	{#if data.guideline}
		<div style:margin-left={toolbarRef?.clientWidth + 'px'} class="h-full p-4 pl-6">
			<div class="grid max-w-6xl grid-cols-2 gap-20">
				<!-- Left Column -->
				<div class="ml-auto w-fit">
					{#each leftColumnRecs as rec, i (rec.id)}
						<GuidelineRecommendation
							recommendation={rec}
							i={2 * i}
							bind:selected={selectedRecommendation}
						/>
					{/each}
				</div>

				<!-- Right Column -->
				<div class="mr-auto w-fit">
					{#each rightColumnRecs as rec, i (rec.id)}
						<GuidelineRecommendation
							recommendation={rec}
							i={2 * i + 1}
							bind:selected={selectedRecommendation}
						/>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
