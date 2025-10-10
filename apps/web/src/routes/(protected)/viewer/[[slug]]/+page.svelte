<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';

	import * as Card from '$lib/components/ui/card';
	import GuidelineRecommendation from '$lib/components/guideline/GuidelineRecommendation.svelte';
	import SelectGuideline from '$lib/components/guideline/SelectGuideline.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { fade } from 'svelte/transition';

	const { data }: PageProps = $props();

	let selectedGuideline = $state(-1);
	let selectRef = $state<HTMLDivElement | null>(null);

	$effect(() => {
		// If no guideline is selected, but there is one in the data, select it
		if (selectedGuideline < 0 && data.guideline) {
			selectedGuideline = data.guideline.id;
		}
	});

	$effect(() => {
		// If a guideline is selected, but it's different from the current one, navigate to it
		if (
			selectedGuideline > 0 &&
			data.guideline?.id !== selectedGuideline &&
			data?.guidelines?.some((g) => g.id === selectedGuideline)
		) {
			goto(`/viewer/${selectedGuideline}`);
		}
	});

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
	<div class="absolute top-4 left-4 z-10">
		<SelectGuideline
			guidelines={data?.guidelines}
			bind:selectedGuidelines={selectedGuideline}
			single={true}
			title="Guideline"
			bind:ref={selectRef}
			description="Please select a guideline to continue"
		/>
	</div>
	{#if data?.guideline?.userId === data?.user.id}
		<div transition:fade={{ duration: 300 }} class="absolute bottom-4 left-4 z-10">
			<Card.Root style={`width:${selectRef?.clientWidth}px`} class="gap-3">
				<Card.Header class="flex flex-col items-center justify-center overflow-hidden">
					<Card.Title class="text-center text-base font-medium text-secondary-foreground"
						>You are the owner of this guideline</Card.Title
					>
					<Card.Description class="ml-2 text-muted-foreground"
						>Edit it in the builder</Card.Description
					>
				</Card.Header>
				<Card.Content
					class="flex flex-col gap-4 pt-0 text-center text-sm text-wrap text-muted-foreground"
				>
					<Button variant="outline" size="sm" onclick={() => goto(`/builder/${data.guideline?.id}`)}
						>Go to Builder</Button
					>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
	{#key data.guideline}
		{#if data.guideline}
			<div style:margin-left={selectRef?.clientWidth + 'px'} class="h-full p-4 pl-6">
				<div class="grid max-w-6xl grid-cols-2 gap-20">
					<!-- Left Column -->
					<div class="ml-auto w-fit">
						{#each leftColumnRecs as rec, i (rec.id)}
							<GuidelineRecommendation
								data={{
									snomedDisplayMap: data.snomedDisplayMap,
									recommendation: rec,
									i: 2 * i,
									isLeftColumn: true,
									svelteFlow: false,
									editable: false,
									class: 'w-full'
								}}
							/>
						{/each}
					</div>

					<!-- Right Column -->
					<div class="mr-auto w-fit">
						{#each rightColumnRecs as rec, i (rec.id)}
							<GuidelineRecommendation
								data={{
									snomedDisplayMap: data.snomedDisplayMap,
									recommendation: rec,
									i: 2 * i + 1,
									isLeftColumn: false,
									editable: false,
									svelteFlow: false,
									class: 'w-full'
								}}
							/>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/key}
</div>
