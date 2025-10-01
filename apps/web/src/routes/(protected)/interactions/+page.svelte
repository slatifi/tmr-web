<script lang="ts">
	import MultiSelectGuideline from '$lib/components/guideline/MultiSelectGuideline.svelte';
	import type { GuidelineWithRelations, RecommendationWithRelations } from '@repo/shared-types';
	import type { PageProps } from './$types';
	import { SvelteFlow, type Node, type Edge, type NodeTypes } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import GuidelineRecommendation from '$lib/components/guideline/GuidelineRecommendation.svelte';
	import InteractionEdge from '$lib/components/guideline/InteractionEdge.svelte';
	import { getSnomedNames } from '$lib/stores/SnomedStore.svelte';

	interface Interaction {
		entity: 'recommendation' | 'contribution';
		id1: number;
		id2: number;
	}

	const { data }: PageProps = $props();

	let selectedGuidelines: number[] = $state([]);
	let loading = $state(false);
	let loaded = $state(false);
	let recommendations: RecommendationWithRelations[] = $state([]);
	let interactions: { [interactionType: string]: Interaction[] } = $state({});
	let snomedDisplayMap: Map<string, string> = $state(new Map());

	async function loadSelectedGuidelines() {
		const guidelines: GuidelineWithRelations[] = [];
		loading = true;
		loaded = false;

		for (const id of selectedGuidelines) {
			const res = await fetch(`/api/guideline/deep/${id}`);
			if (res.ok) {
				const guideline = await res.json();
				guidelines.push(guideline as GuidelineWithRelations);
			}
		}

		// Load interactions with url params as comma separated guideline ids
		const res = await fetch(`/api/interaction?ids=${selectedGuidelines.join(',')}`);
		if (res.ok) {
			interactions = await res.json();
			recommendations = guidelines.flatMap((g) => g.recommendations);

			const codes = recommendations.map((r) => r.action);
			// add contribution properties to actions
			recommendations.forEach((rec) => {
				if (rec.contributions && rec.contributions.length > 0) {
					rec.contributions.forEach((contribution) => {
						if (contribution.transition) codes.push(contribution.transition.property);
					});
				}
			});

			// Fetch SNOMED display names for all codes
			snomedDisplayMap = await getSnomedNames(codes);
		}

		loading = false;
		loaded = true;
	}

	// Function to calculate dynamic positions for nodes
	function calculateNodePositions(): Node[] {
		if (!recommendations || recommendations.length === 0) return [];

		// Calculate columns based on number of recommendations
		const columnsCount = 2;
		const columnWidth = 500;
		const nodeSpacing = 100;

		const nodes: Node[] = [];
		const columnHeights: number[] = [0, 0]; // Track current height of each column

		recommendations.forEach((rec, index) => {
			// Determine which column to place this recommendation in
			const columnIndex = index % columnsCount;
			const xPosition = columnIndex * columnWidth + 90;
			const yPosition = columnHeights[columnIndex];

			// Add recommendation node
			nodes.push({
				id: `rec-${rec.id}`,
				type: 'recommendation',
				position: { x: xPosition, y: yPosition },
				data: {
					recommendation: rec,
					i: index,
					selected: null, // No selection in interactions view
					snomedDisplayMap: snomedDisplayMap || {},
					editable: false,
					isLeftColumn: columnIndex === 0,
					class: 'w-60'
				},
				draggable: false
			});

			// Estimate recommendation node height
			const estimatedRecHeight = (rec.contributions?.length || 0) * 60;
			columnHeights[columnIndex] += estimatedRecHeight + nodeSpacing;
		});

		return nodes;
	}

	// Create all nodes (recommendations + contributions)
	const allNodes = $derived.by((): Node[] => {
		if (loading || recommendations.length === 0) return [];
		return calculateNodePositions();
	});

	// Create edges from interaction data
	const edges = $derived.by((): Edge[] => {
		if (loading || Object.keys(interactions).length === 0) return [];

		const allEdges: Edge[] = [];
		let edgeIndex = 0;

		// Process each interaction type
		Object.entries(interactions).forEach(([interactionType, interactionList]) => {
			interactionList.forEach((interaction) => {
				const sourceId =
					interaction.entity === 'recommendation'
						? `rec-${interaction.id1}`
						: `contrib-${interaction.id1}`;
				const targetId =
					interaction.entity === 'recommendation'
						? `rec-${interaction.id2}`
						: `contrib-${interaction.id2}`;

				allEdges.push({
					id: `edge-${edgeIndex++}`,
					source:
						interaction.entity === 'recommendation'
							? `rec-${interaction.id1}`
							: `rec-${
									recommendations.find((rec) =>
										rec.contributions?.some((c) => c.id === interaction.id1)
									)?.id
								}`,
					target:
						interaction.entity === 'recommendation'
							? `rec-${interaction.id2}`
							: `rec-${
									recommendations.find((rec) =>
										rec.contributions?.some((c) => c.id === interaction.id2)
									)?.id
								}`,
					sourceHandle: sourceId,
					targetHandle: targetId,
					type: 'interaction',
					label: interactionType,
					animated: true
				});
			});
		});

		return allEdges;
	});

	const nodeTypes: NodeTypes = {
		// @ts-expect-error Extra prop
		recommendation: GuidelineRecommendation
	};

	const edgeTypes = {
		interaction: InteractionEdge
	};

	// Summary statistics
	const stats = $derived.by(() => {
		const totalInteractions = Object.values(interactions).length;
		const interactionTypes = Object.keys(interactions).length;

		return {
			recommendations: recommendations.length,
			contributions: recommendations.reduce(
				(sum, rec) => sum + (rec.contributions?.length || 0),
				0
			),
			interactions: totalInteractions,
			interactionTypes
		};
	});
</script>

<div
	class="relative h-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
>
	<!-- Guidelines Selection Panel (top left) -->
	<div class="absolute top-4 left-4 z-10">
		<MultiSelectGuideline
			guidelines={data?.guidelines}
			bind:selectedGuidelines
			onSubmit={loadSelectedGuidelines}
			disabled={loading}
		/>
	</div>

	<!-- Statistics Panel (bottom left) -->
	{#if recommendations.length > 0 && !loading}
		<div
			class="absolute bottom-4 left-4 z-10 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
		>
			<h3 class="mb-2 text-sm font-semibold text-gray-800">Interaction Summary</h3>
			<div class="space-y-1 text-xs text-gray-600">
				<div>Recommendations: {stats.recommendations}</div>
				<div>Contributions: {stats.contributions}</div>
				<div>Interactions: {stats.interactions}</div>
				<div>Interaction Types: {stats.interactionTypes}</div>
			</div>

			{#if Object.keys(interactions).length > 0}
				<div class="mt-3 border-t pt-2">
					<h4 class="mb-1 text-xs font-medium text-gray-700">Types:</h4>
					<div class="space-y-1">
						{#each Object.entries(interactions) as [type, list], index (index)}
							<div class="flex justify-between text-xs">
								<span class="text-gray-600">{type}:</span>
								<span class="font-medium">{list.length}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Empty State -->
	{#if !loading && recommendations.length === 0 && selectedGuidelines.length > 0 && loaded}
		<div class="flex h-full items-center justify-center">
			<div class="rounded-lg bg-white p-8 text-center shadow-lg">
				<h3 class="mb-2 text-lg font-semibold text-gray-800">No Data Found</h3>
				<p class="text-gray-600">
					No recommendations or interactions found for the selected guidelines.
				</p>
			</div>
		</div>
	{/if}

	<!-- Flow Diagram -->
	{#if !loading && recommendations.length > 0}
		<div class="h-full bg-none p-4 pl-6">
			<SvelteFlow
				nodes={allNodes}
				{edges}
				{nodeTypes}
				{edgeTypes}
				fitView
				minZoom={0.5}
				maxZoom={1}
				style="width: 100%; height: 100%; background: none;"
			></SvelteFlow>
		</div>
	{/if}

	<!-- Instructions -->
	{#if !loading && recommendations.length === 0 && selectedGuidelines.length === 0}
		<div class="flex h-full items-center justify-center">
			<div class="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
				<h3 class="mb-4 text-xl font-semibold text-gray-800">Guideline Interactions</h3>
				<p class="mb-4 text-gray-600">
					Select one or more guidelines to visualise the interactions between their recommendations
					and contributions.
				</p>
				<div class="text-sm text-gray-500">
					Use the selection panel in the top-left corner to get started.
				</div>
			</div>
		</div>
	{/if}
</div>
