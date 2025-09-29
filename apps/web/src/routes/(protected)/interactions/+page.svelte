<script lang="ts">
	import MultiSelectGuideline from '$lib/components/guideline/MultiSelectGuideline.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	let selectedGuidelines: number[] = $state([]);
</script>

<div
	class="relative h-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
>
	<MultiSelectGuideline
		guidelines={data?.guidelines}
		bind:selectedGuidelines
		onSubmit={() => console.log($state.snapshot(selectedGuidelines))}
	/>
</div>
