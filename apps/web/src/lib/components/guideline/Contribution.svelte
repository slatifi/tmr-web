<script lang="ts">
	import type { ContributionWithRelations } from '@repo/shared-types';
	import { Plus, Minus, ArrowRight, Trash2Icon } from '@lucide/svelte';
	import { Handle, Position } from '@xyflow/svelte';

	interface Props {
		contribution: ContributionWithRelations;
		i: number;
		ci: number;
		handleDelete: (id: number) => void;
		editable?: boolean;
		snomedDisplayMap: Record<string, string>;
		isLeftColumn?: boolean;
	}
	let { data }: { data: Props } = $props();
	let {
		contribution,
		i,
		ci,
		handleDelete,
		editable = true,
		snomedDisplayMap,
		isLeftColumn = true
	}: Props = data;
</script>

{#if contribution.transition}
	<div
		class="flex min-w-[180px] items-center justify-between gap-4 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm"
	>
		{#if !editable}
			<Handle
				type="source"
				position={isLeftColumn ? Position.Right : Position.Left}
				style="background: #555; width: 6px; height: 6px;"
			/>
			<Handle
				type="target"
				position={isLeftColumn ? Position.Right : Position.Left}
				style="background: #555; width: 6px; height: 6px;"
			/>
		{/if}
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
				{snomedDisplayMap[contribution.transition.property] || contribution.transition.property}
			</div>
			<div class="flex items-center gap-2 text-xs">
				<span class="font-medium text-gray-700">{contribution.transition.pre}</span>
				<ArrowRight class="h-3 w-3 text-gray-500" />
				<span class="font-medium text-gray-700">{contribution.transition.post}</span>
			</div>
		</div>
		<div>
			{#if editable}
				<button
					class="rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200 hover:ring-2 hover:ring-red-300 hover:outline-none"
					onclick={() => handleDelete(contribution.id)}
				>
					<Trash2Icon class="h-4 w-4" />
				</button>
			{/if}
		</div>
	</div>
{/if}
