<script lang="ts">
	import { BaseEdge, EdgeLabel, getBezierPath, type EdgeProps } from '@xyflow/svelte';

	let { id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, label }: EdgeProps =
		$props();

	const [edgePath, labelX, labelY] = $derived(
		getBezierPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition
		})
	);

	// Color coding for different interaction types
	const getInteractionColor = (label: string) => {
		const colors: Record<string, string> = {
			alternative: '#3b82f6', // blue
			divergent: '#ef4444', // red
			repetition: '#10b981' // green
		};
		return colors[label?.toLowerCase()] || '#6b7280'; // default gray
	};

	const color = getInteractionColor(label || '');
</script>

<BaseEdge {id} path={edgePath} />
<EdgeLabel x={labelX} y={labelY}>
	<div
		class="w-fit rounded bg-white px-1 text-xs font-medium shadow"
		style={`border: 1px solid ${color}; color: ${color};`}
	>
		{label}
	</div>
</EdgeLabel>
