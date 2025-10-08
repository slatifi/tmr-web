<script lang="ts">
	import CreateModal from '$lib/components/guideline/CreateGuidelineModal.svelte';
	import SelectGuideline from '$lib/components/guideline/SelectGuideline.svelte';

	import { invalidate } from '$app/navigation';

	let { guidelines, selectedGuideline = $bindable(-1) } = $props();

	let createModalOpen = $state(false);
	$effect(() => {
		if (selectedGuideline === -2) {
			createModalOpen = true;
			selectedGuideline = '';
		}
	});

	function handleCreation(id: number) {
		invalidate('app:guidelines');
		selectedGuideline = id;
	}
</script>

<div class="absolute top-4 left-4">
	<CreateModal bind:open={createModalOpen} {handleCreation} />
	<SelectGuideline
		{guidelines}
		bind:selectedGuidelines={selectedGuideline}
		single={true}
		title="Guideline"
		description="Please select a guideline to continue"
		additionalItems={[{ id: -2, title: '+ Create new guideline' }]}
	/>
</div>
