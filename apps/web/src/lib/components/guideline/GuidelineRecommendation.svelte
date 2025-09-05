<script lang="ts">
	import { ArrowRight, Minus, Plus, Trash2Icon } from '@lucide/svelte';
	import type { RecommendationWithRelations } from '@repo/shared-types';
	import DeleteModal from './DeleteModal.svelte';

	interface Props {
		recommendation: RecommendationWithRelations;
		i: number;
		selected: number | null;
	}

	let { recommendation, i = 0, selected = $bindable(null) }: Props = $props();

	let deleteContributionOpen = $state(false);
	let selectedContributionId: number | null = $state(null);
	let selectedContribution = $derived.by(() => {
		return recommendation.contributions.find((c) => c.id === selectedContributionId) || null;
	});

	function handleOpenDeleteContribution(id: number) {
		selectedContributionId = id;
		deleteContributionOpen = true;
	}

	// Determine colors based on strength
	const isShould = recommendation.strength === 'SHOULD';
	const borderColor = isShould ? 'border-blue-500' : 'border-orange-500';
	const textColor = isShould ? 'text-blue-500' : 'text-orange-500';
</script>

<div class="relative mb-8 flex w-full items-start justify-end gap-4">
	<div class="flex h-full w-full flex-col justify-center gap-2">
		<div
			class="border-2 bg-white {borderColor} w-full min-w-[140px] rounded-lg px-4 py-3 shadow-sm hover:cursor-pointer {selected ===
			recommendation.id
				? 'ring-2 ring-green-500 ring-offset-2'
				: ''}"
			onclick={(e) =>
				selected === recommendation.id
					? ((selected = null), e.currentTarget.blur())
					: (selected = recommendation.id)}
			onkeydown={(e) => e.key === 'Escape' && (selected = null)}
			onblur={(e) => e.preventDefault()}
			role="button"
			tabindex="0"
		>
			<div class="flex justify-center gap-1 text-sm">
				<p>R{i + 1}:</p>
				<span class="font-semibold {textColor} whitespace-nowrap lowercase">
					{recommendation.strength === 'NOT' ? 'should not' : recommendation.strength}
				</span>
			</div>

			<div class="text-center text-sm font-medium text-gray-800">
				{recommendation.action}
			</div>
		</div>

		<!-- Contributions -->
		{#if recommendation.contributions && recommendation.contributions.length > 0}
			<div class="flex flex-col justify-center gap-2">
				{#each recommendation.contributions as contribution, ci (contribution.id)}
					{#if contribution.transition}
						<div
							class="flex min-w-[180px] items-center justify-between gap-4 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm"
						>
							<div>
								<div class="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
									{#if contribution.value === 'POSITIVE'}
										<Plus class="inline h-3 w-3 text-green-600" />
									{:else if contribution.value === 'NEGATIVE'}
										<Minus class="inline h-3 w-3 text-red-600" />
									{:else}
										<span class="inline-block h-3 w-3 rounded-full bg-gray-400"></span>
									{/if}
									C{i + 1}.{ci + 1}:
									{contribution.transition.derivative.toLowerCase()}
									{contribution.transition.property}
								</div>
								<div class="flex items-center gap-2 text-xs">
									<span class="font-medium text-gray-700">{contribution.transition.pre}</span>
									<ArrowRight class="h-3 w-3 text-gray-500" />
									<span class="font-medium text-gray-700">{contribution.transition.post}</span>
								</div>
							</div>
							<div>
								<button
									class="rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200 hover:ring-2 hover:ring-red-300 hover:outline-none"
									onclick={() => handleOpenDeleteContribution(contribution.id)}
								>
									<Trash2Icon class="h-4 w-4" />
								</button>
							</div>
						</div>
					{/if}
				{/each}
			</div>
			<DeleteModal
				bind:open={deleteContributionOpen}
				resourceType="contribution"
				resourceId={selectedContributionId || undefined}
				resourceTitle={`${selectedContribution?.transition?.derivative.toLowerCase()} ${selectedContribution?.transition?.property}`}
				invalidationRoute="guideline"
			/>
		{/if}
	</div>
</div>
