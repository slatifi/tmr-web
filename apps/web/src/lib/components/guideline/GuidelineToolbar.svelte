<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Label from '../ui/label/label.svelte';
	import { fade } from 'svelte/transition';
	import { invalidate } from '$app/navigation';
	import DeleteModal from './DeleteModal.svelte';
	import type { Guideline, Recommendation } from '@repo/shared-types';
	import { Separator } from '../ui/separator';
	import CreateRecommendationModal from './CreateRecommendationModal.svelte';
	import CreateContributionModal from './CreateContributionModal.svelte';

	interface Props {
		guideline: Guideline | null;
		ref: HTMLDivElement | null;
		recommendationId: number | null;
		recommendation: Recommendation | null;
	}

	let {
		guideline,
		ref = $bindable(null),
		recommendationId = $bindable(null),
		recommendation
	}: Props = $props();

	let tempTitle = $state('');
	let tempDescription = $state('');
	let error: string | null = $state(null);
	let deleteGuidelineModalOpen = $state(false);
	let createRecommendationModalOpen = $state(false);
	let deleteRecommendationModalOpen = $state(false);
	let createContributionModalOpen = $state(false);

	let titleInput: HTMLInputElement | null = $state(null);
	let descInput: HTMLTextAreaElement | null = $state(null);

	$effect(() => {
		if (guideline) {
			tempTitle = guideline.title;
			tempDescription = guideline.description || '';
		}
	});

	function saveTitle() {
		titleInput?.blur();
		if (guideline?.title !== tempTitle) onTitleOrDescriptionChange({ title: tempTitle });
	}

	function saveDescription() {
		descInput?.blur();
		if (guideline?.description !== tempDescription)
			onTitleOrDescriptionChange({ description: tempDescription });
	}

	function changeTextareaHeight() {
		if (descInput) {
			descInput.style.height = 'auto';
			descInput.style.height = descInput.scrollHeight + 'px';
		}
	}

	async function onTitleOrDescriptionChange(data: { title?: string; description?: string }) {
		if (!guideline) return;
		error = null;

		try {
			const res = await fetch(`/api/guideline/${guideline.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (!res.ok) {
				const resData = await res.json();
				error = resData.message || 'Failed to update guideline. Please try again.';
				return;
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error(err);
		} finally {
			invalidate('app:guidelines');
		}
	}
</script>

{#if guideline}
	<div transition:fade>
		<Card.Root
			class="absolute bottom-2 left-2 flex w-84  max-w-[90vw] min-w-[250px] flex-col gap-0 p-4"
			bind:ref
		>
			<Card.Header class="w-full gap-0 p-0">
				<Card.Title
					class="flex w-full flex-wrap items-start gap-2 break-words text-secondary-foreground"
				>
					{#if error}
						<div
							class="mb-2 w-full rounded-md bg-destructive/10 p-2 text-sm font-medium text-destructive"
						>
							{error}
						</div>
					{/if}

					<input
						bind:value={tempTitle}
						bind:this={titleInput}
						class="w-full border-b-1 border-transparent px-0 py-1 text-xl transition-all duration-300 ease-in-out hover:border-b-primary focus:border-b-primary focus:ring-0 focus:outline-none"
						onblur={() => saveTitle()}
						onkeydown={(e) => e.key === 'Enter' && titleInput?.blur()}
						name="title"
					/>
				</Card.Title>
				<Card.Description class="mt-1 flex w-full flex-wrap items-start gap-2 break-words">
					<textarea
						bind:value={tempDescription}
						bind:this={descInput}
						class="h-12 w-full resize-none border-b-1 border-transparent bg-transparent px-0 py-1 text-sm transition-all duration-300 ease-in-out hover:border-b-primary focus:border-b-primary focus:ring-0 focus:outline-none"
						placeholder="Add a description..."
						oninput={() => changeTextareaHeight()}
						onblur={() => saveDescription()}
						onkeydown={(e) =>
							e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), descInput?.blur())}
						name="description"
					></textarea>
				</Card.Description>
			</Card.Header>
			<Label class="mt-2 mb-3 text-sm font-semibold text-muted-foreground">Actions</Label>
			<!-- ---------------------- -->
			<!-- Actions related to the current guideline go here.  -->
			{#if recommendationId}
				<CreateContributionModal bind:open={createContributionModalOpen} {recommendationId} />
				<Button
					size="sm"
					variant="outline"
					class="mb-2 w-full"
					onclick={() => (createContributionModalOpen = true)}>Add Contribution</Button
				>
				<DeleteModal
					bind:open={deleteRecommendationModalOpen}
					resourceType="recommendation"
					resourceId={recommendationId}
					resourceTitle={recommendation?.action}
					invalidationRoute="guideline"
					onDelete={() => (recommendationId = null)}
				/>
				<Button
					variant="destructive"
					size="sm"
					onclick={() => (deleteRecommendationModalOpen = true)}
					class="w-full">Delete Recommendation</Button
				>
				<Separator class="my-2" />
			{:else}
				<div class="mb-2 text-center text-sm text-muted-foreground italic">
					Select a recommendation for more actions
					<Separator class="my-2" />
				</div>
			{/if}
			<Button
				size="sm"
				variant="outline"
				class="mb-2 w-full"
				onclick={() => (createRecommendationModalOpen = true)}>Add Recommendation</Button
			>
			<CreateRecommendationModal
				bind:open={createRecommendationModalOpen}
				guidelineId={guideline?.id}
			/>
			<!-- Delete button -->
			<Button
				variant="destructive"
				size="sm"
				onclick={() => (deleteGuidelineModalOpen = true)}
				class="w-full">Delete Guideline</Button
			>
			<DeleteModal
				bind:open={deleteGuidelineModalOpen}
				resourceType="guideline"
				resourceId={guideline?.id}
				resourceTitle={guideline?.title}
				onDelete={() => (guideline = null)}
			/>
		</Card.Root>
	</div>
{/if}
