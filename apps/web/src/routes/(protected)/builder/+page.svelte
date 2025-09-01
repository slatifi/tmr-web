<script lang="ts">
	import type { PageProps } from './$types';
	import SelectGuideline from '$lib/components/guideline/SelectGuideline.svelte';
	import GuidelineToolbar from '$lib/components/guideline/GuidelineToolbar.svelte';

	const { data }: PageProps = $props();

	let selectedGuideline = $state('');
	let guideline = $derived(
		() => data?.guidelines?.find((g) => g.id.toString() === selectedGuideline) || null
	);
</script>

<div
	class="relative h-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
>
	<SelectGuideline bind:selectedGuideline guidelines={data?.guidelines} />
	<GuidelineToolbar guideline={guideline()} />
</div>
