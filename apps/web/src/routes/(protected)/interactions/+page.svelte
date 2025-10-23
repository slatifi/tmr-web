<script lang="ts">
	import type { GuidelineWithRelations, RecommendationWithRelations } from '@repo/shared-types';
	import type { PageProps } from './$types';

	import { SvelteFlow, type Node, type Edge, type NodeTypes } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import SelectGuideline from '$lib/components/guideline/SelectGuideline.svelte';
	import GuidelineRecommendation from '$lib/components/guideline/GuidelineRecommendation.svelte';
	import InteractionEdge from '$lib/components/guideline/InteractionEdge.svelte';

	import { getSnomedNames } from '$lib/stores/SnomedStore.svelte';

	import { SvelteMap } from 'svelte/reactivity';
	import { fetchWithCredentials, getColourFromId } from '$lib/utils';

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
	let guidelineMap: Map<number, { id: number; name: string }> = $state(new Map());
	let selectRef: HTMLDivElement | null = $state(null);

	async function loadSelectedGuidelines() {
		const guidelines: GuidelineWithRelations[] = [];
		loading = true;
		loaded = false;

		for (const id of selectedGuidelines) {
			const res = await fetchWithCredentials(`/api/guideline/deep/${id}`);
			if (res.ok) {
				const guideline = await res.json();
				guidelines.push(guideline as GuidelineWithRelations);
			}
		}

		// Load interactions with url params as comma separated guideline ids
		const res = await fetchWithCredentials(`/api/interaction?ids=${selectedGuidelines.join(',')}`);
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

			// Generate a map from recommendation id to guideline id/name
			guidelineMap = new SvelteMap();
			guidelines.forEach((g) => {
				g.recommendations.forEach((rec) => {
					guidelineMap.set(rec.id, { id: g.id, name: g.title });
				});
			});
		}

		loading = false;
		loaded = true;
	}

	const allNodes = $derived.by((): Node[] => {
		if (loading || !recommendations || recommendations.length === 0) return [];

		// Calculate columns based on number of recommendations
		const columnsCount = 2;
		const columnWidth = 500;
		const nodeSpacing = 85;

		const nodes: Node[] = [];
		const columnHeights: number[] = [0, 0]; // Track current height of each column

		recommendations.forEach((rec, index) => {
			// Determine which column to place this recommendation in
			const columnIndex = index % columnsCount;
			const xPosition = columnIndex * columnWidth + 90;
			const yPosition = columnHeights[columnIndex];

			// Estimate number of lines for action text (assuming 29 chars per line based on fixed width)
			const lines = Math.ceil((snomedDisplayMap.get(rec.action)?.length || 0) / 29) || 1;

			// Estimate number of lines for contributions (assuming 14 chars per line based on fixed width)
			const contributionsLines =
				Math.ceil(
					rec.contributions?.reduce((sum, c) => {
						return sum + (snomedDisplayMap.get(c.transition?.property || '')?.length || 0);
					}, 0) / 14
				) || 0;

			// Add recommendation node
			nodes.push({
				id: `rec-${rec.id}`,
				type: 'recommendation',
				position: { x: xPosition, y: yPosition },
				data: {
					recommendation: rec,
					i: index,
					snomedDisplayMap: snomedDisplayMap || {},
					editable: false,
					svelteFlow: true,
					guidelineInfo: guidelineMap.get(rec.id),
					isLeftColumn: columnIndex === 0
				},
				draggable: true
			});

			// Estimate recommendation node height
			const estimatedRecHeight =
				(rec.contributions?.length || 0) * 50 + lines * 15 + contributionsLines * 15;
			columnHeights[columnIndex] += estimatedRecHeight + nodeSpacing;
		});

		return nodes;
	});

	// Instead of searching through recommendations each time, create a map
	const contribToRecMap = $derived.by(() => {
		const map = new SvelteMap<number, number>();
		for (const rec of recommendations) {
			for (const contrib of rec.contributions ?? []) {
				map.set(contrib.id, rec.id);
			}
		}
		return map;
	});

	// Create edges from interaction data
	const edges = $derived.by((): Edge[] => {
		if (loading || Object.keys(interactions).length === 0) return [];

		const allEdges: Edge[] = [];
		let edgeIndex = 0;

		// Process each interaction type
		Object.entries(interactions).forEach(([interactionType, interactionList]) => {
			interactionList.forEach((interaction) => {
				let source: string;
				let target: string;
				let sourceHandle: string;
				let targetHandle: string;

				if (interaction.entity === 'recommendation') {
					source = `rec-${interaction.id1}`;
					target = `rec-${interaction.id2}`;
					sourceHandle = source;
					targetHandle = target;
				} else {
					// contribution
					source = `rec-${contribToRecMap.get(interaction.id1)}`;
					target = `rec-${contribToRecMap.get(interaction.id2)}`;
					sourceHandle = `contrib-${interaction.id1}`;
					targetHandle = `contrib-${interaction.id2}`;
				}

				allEdges.push({
					id: `edge-${edgeIndex++}`,
					source,
					target,
					sourceHandle,
					targetHandle,
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
		<SelectGuideline
			guidelines={data?.guidelines}
			bind:selectedGuidelines
			bind:ref={selectRef}
			onSubmit={loadSelectedGuidelines}
			disabled={loading}
			single={false}
		/>
	</div>

	{#if recommendations.length > 0 && !loading}
		<!-- Statistics Panel (bottom left) -->
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

		<!-- Guideline Key Panel (bottom right) -->
		<div
			class="absolute right-4 bottom-4 z-10 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
		>
			<h3 class="mb-2 text-sm font-semibold text-gray-800">Guideline Key</h3>
			<div class="space-y-2 text-xs text-gray-600">
				{#each selectedGuidelines as guidelineId (guidelineId)}
					<div class="flex items-center gap-2">
						<div
							class="h-3 w-3 flex-shrink-0 rounded-sm"
							style={`background-color: ${getColourFromId(guidelineId)}`}
						></div>
						<span>{data?.guidelines.find((g) => g.id === guidelineId)?.title}</span>
					</div>
				{/each}
			</div>
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
				fitViewOptions={{ padding: { left: `${(selectRef?.clientWidth ?? 0) + 20}px` } }}
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
