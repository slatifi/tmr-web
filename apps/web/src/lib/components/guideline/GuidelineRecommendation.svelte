<script lang="ts">
	import type { RecommendationWithRelations } from '@repo/shared-types';
	import DeleteModal from './DeleteModal.svelte';
	import Contribution from './Contribution.svelte';
	import { Handle, Position } from '@xyflow/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		recommendation: RecommendationWithRelations;
		i: number;
		snomedDisplayMap: Map<string, string>;
		editable?: boolean;
		withContributions?: boolean;
		isLeftColumn?: boolean;
		class?: string;
	}

	let { selected = $bindable(null), data }: { selected?: number | null; data: Props } = $props();

	let {
		recommendation,
		i,
		snomedDisplayMap,
		editable = true,
		withContributions = true,
		isLeftColumn = true,
		class: className = ''
	}: Props = data;

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

	const handleStyle = (isLeft: boolean) =>
		`top: 50%; transform: translateY(-50%); left: ${isLeft ? 'auto' : '-4px'}; right: ${
			isLeft ? '-4px' : 'auto'
		};`;
</script>

<div class={cn('relative mb-8 flex w-fit items-start justify-end gap-4', className)}>
	<div class="flex h-full w-full flex-col justify-center gap-2">
		<div
			class="relative border-2 bg-white {borderColor} w-full min-w-[140px] rounded-lg px-4 py-3 shadow-sm hover:cursor-pointer {selected ===
			recommendation.id
				? 'ring-2 ring-green-500 ring-offset-2'
				: ''}"
			onclick={editable
				? (e) =>
						selected === recommendation.id
							? ((selected = null), e.currentTarget.blur())
							: (selected = recommendation.id)
				: undefined}
			onkeydown={(e) => e.key === 'Escape' && (selected = null)}
			onblur={(e) => e.preventDefault()}
			role="button"
			tabindex="0"
		>
			{#if !editable}
				<Handle
					type="source"
					position={isLeftColumn ? Position.Right : Position.Left}
					id="rec-{recommendation.id}"
					style={handleStyle(isLeftColumn)}
				/>
				<Handle
					type="target"
					position={isLeftColumn ? Position.Right : Position.Left}
					id="rec-{recommendation.id}"
					style={handleStyle(isLeftColumn)}
				/>
			{/if}

			<div class="flex justify-center gap-1 text-sm">
				<p>R{i + 1}:</p>
				<span class="font-semibold {textColor} whitespace-nowrap lowercase">
					{recommendation.strength === 'NOT' ? 'should not' : recommendation.strength}
				</span>
			</div>

			<div class="text-center text-sm font-medium text-gray-800">
				{#if recommendation.actionPrefix}
					{`${recommendation.actionPrefix} `}
				{/if}
				{snomedDisplayMap[recommendation.action] || recommendation.action}
			</div>
		</div>

		<!-- Contributions -->
		{#if withContributions && recommendation.contributions && recommendation.contributions.length > 0}
			<div class="flex flex-col justify-center gap-2">
				{#each recommendation.contributions as contribution, ci (contribution.id)}
					<Contribution
						data={{
							contribution,
							i,
							ci,
							handleDelete: handleOpenDeleteContribution,
							editable,
							snomedDisplayMap,
							isLeftColumn
						}}
					/>
				{/each}
			</div>
			{#if editable}
				<DeleteModal
					bind:open={deleteContributionOpen}
					resourceType="contribution"
					resourceId={selectedContributionId || undefined}
					resourceTitle={`${selectedContribution?.transition?.derivative.toLowerCase()} ${
						(selectedContribution?.transition?.property &&
							snomedDisplayMap[selectedContribution?.transition?.property]) ||
						selectedContribution?.transition?.property
					}`}
					invalidationRoute="guideline"
				/>
			{/if}
		{/if}
	</div>
</div>
