<script lang="ts">
	import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/svelte';

	let { sourceX, sourceY, targetX, targetY, ...props }: EdgeProps = $props();

	const [edgePath] = $derived(
		getBezierPath({
			sourceX,
			sourceY,
			targetX,
			targetY
		})
	);

	const { markerStart, markerEnd, interactionWidth, label, labelStyle } = props;

	// Color coding for different interaction types
	const getInteractionColor = (label: string) => {
		const colors: Record<string, string> = {
			influences: '#3b82f6', // blue
			contradicts: '#ef4444', // red
			supports: '#10b981', // green
			'conflicts with': '#f59e0b', // amber
			'depends on': '#8b5cf6', // purple
			enables: '#06b6d4' // cyan
		};
		return colors[label.toLowerCase()] || '#6b7280'; // default gray
	};

	const color = getInteractionColor(label || '');
</script>

<BaseEdge
	path={edgePath}
	{markerStart}
	{markerEnd}
	{interactionWidth}
	{label}
	labelStyle={`${labelStyle} fill: ${color}; font-weight: bold;`}
/>
