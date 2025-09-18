<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import CreateModal from '$lib/components/guideline/CreateGuidelineModal.svelte';
	import { Loader2Icon } from '@lucide/svelte';
	import { invalidate } from '$app/navigation';

	let { guidelines, selectedGuideline = $bindable('') } = $props();

	let guidelineName = $derived.by(() => {
		if (selectedGuideline === 'new') {
			return 'New Guideline';
		}
		const guidline = guidelines?.find((g) => g.id.toString() === selectedGuideline);
		return guidline ? guidline.title : 'Select Guideline';
	});

	let createModalOpen = $state(false);
	$effect(() => {
		if (selectedGuideline === 'new') {
			createModalOpen = true;
			selectedGuideline = '';
		}
	});

	function handleCreation(id: number) {
		invalidate('app:guidelines');
		selectedGuideline = id.toString();
	}
</script>

<Card.Root class="absolute top-2 left-2 w-84 gap-4 p-4">
	<CreateModal bind:open={createModalOpen} {handleCreation} />
	<Card.Header class="p-0">
		<Card.Title class="text-secondary-foreground">Guideline</Card.Title>
		<Card.Description>Please select a guideline to continue</Card.Description>
	</Card.Header>
	<Card.Content class="px-0">
		<form>
			<Select.Root type="single" bind:value={selectedGuideline}>
				<Select.Trigger
					class="w-full {selectedGuideline ? 'text-secondary-foreground' : 'text-muted-foreground'}"
					>{guidelineName}</Select.Trigger
				>
				<Select.Content>
					{#await guidelines}
						<Select.Item value="loading" disabled>
							Loading...
							<Loader2Icon class="ml-2 inline-block animate-spin" />
						</Select.Item>
					{:then guidelines}
						<Select.Item value="new">+ Create new guideline</Select.Item>
						<Select.Separator />
						{#each guidelines as guideline (guideline.id)}
							<Select.Item value={guideline.id.toString()}>{guideline.title}</Select.Item>
						{/each}
					{/await}
				</Select.Content>
			</Select.Root>
		</form>
	</Card.Content>
</Card.Root>
