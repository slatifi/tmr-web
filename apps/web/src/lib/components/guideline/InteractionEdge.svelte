<script lang="ts">
	import {
		BaseEdge,
		EdgeLabel,
		getBezierPath,
		type EdgeProps,
		useNodes,
		useSvelteFlow
	} from '@xyflow/svelte';
	import { edgeLabelStore } from '$lib/stores/EdgeLabelStore.svelte';
	import { onDestroy } from 'svelte';

	let { id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, label }: EdgeProps =
		$props();

	const nodes = useNodes();
	const { getNodesBounds } = useSvelteFlow();

	const LABEL_PADDING = 4;
	const NODE_PADDING = 8;

	const getInteractionColor = (label: string) => {
		const colors: Record<string, string> = {
			alternative: '#3b82f6',
			recommondation_contradiction: '#f63b3b',
			contribution_contradiction: '#f63b3b',
			divergent: '#ef4444',
			repetition: '#10b981',
			repairable: '#9027db',
			side_effect: '#f59e0b'
		};
		return colors[label?.toLowerCase()] || '#6b7280';
	};

	const getInteractionName = (label: string) => {
		if (label.includes('contradiction')) {
			return 'contradiction';
		} else if (label.includes('_')) {
			return label.replace('_', ' ');
		}
		return label;
	};

	const color = getInteractionColor(label || '');
	const labelWidth = 80;
	const labelHeight = 24;

	const generateSpiralOffsets = (maxRadius: number, step: number) => {
		const offsets: { dy: number; dx: number }[] = [];
		const angles = [0, 45, 90, 135, 180, 225, 270, 315];

		for (let radius = step; radius <= maxRadius; radius += step) {
			for (const angle of angles) {
				const radians = (angle * Math.PI) / 180;
				offsets.push({
					dx: Math.cos(radians) * radius,
					dy: Math.sin(radians) * radius
				});
			}
		}
		return offsets;
	};

	const isPositionOccupied = (x: number, y: number, width: number, height: number) => {
		return edgeLabelStore.getOtherPositions(id).some((occupied) => {
			return !(
				x + width + LABEL_PADDING < occupied.x ||
				x > occupied.x + occupied.width + LABEL_PADDING ||
				y + height + LABEL_PADDING < occupied.y ||
				y > occupied.y + occupied.height + LABEL_PADDING
			);
		});
	};

	const overlapsWithNodes = (x: number, y: number, width: number, height: number) => {
		return nodes.current.some((node) => {
			const { x: nodeX, y: nodeY, width: nodeWidth, height: nodeHeight } = getNodesBounds([node]);

			return !(
				x + width + NODE_PADDING < nodeX ||
				x > nodeX + nodeWidth + NODE_PADDING ||
				y + height + NODE_PADDING < nodeY ||
				y > nodeY + nodeHeight + NODE_PADDING
			);
		});
	};

	const findOptimalLabelPosition = (
		defaultX: number,
		defaultY: number
	): { x: number; y: number } => {
		// Try default position first
		if (
			!isPositionOccupied(
				defaultX - labelWidth / 2,
				defaultY - labelHeight / 2,
				labelWidth,
				labelHeight
			) &&
			!overlapsWithNodes(
				defaultX - labelWidth / 2,
				defaultY - labelHeight / 2,
				labelWidth,
				labelHeight
			)
		) {
			return { x: defaultX, y: defaultY };
		}

		const offsets = generateSpiralOffsets(120, 12);

		for (const offset of offsets) {
			const testX = defaultX + offset.dx;
			const testY = defaultY + offset.dy;
			if (
				!isPositionOccupied(
					testX - labelWidth / 2,
					testY - labelHeight / 2,
					labelWidth,
					labelHeight
				) &&
				!overlapsWithNodes(testX - labelWidth / 2, testY - labelHeight / 2, labelWidth, labelHeight)
			) {
				return { x: testX, y: testY };
			}
		}
		return { x: defaultX, y: defaultY };
	};

	const [defaultEdgePath, defaultLabelX, defaultLabelY] = $derived(
		getBezierPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition
		})
	);

	let optimalLabelPosition = $state({ x: 0, y: 0 });

	$effect(() => {
		const newPos = findOptimalLabelPosition(defaultLabelX, defaultLabelY);

		optimalLabelPosition.x = newPos.x;
		optimalLabelPosition.y = newPos.y;

		const currentInStore = edgeLabelStore.getPosition(id);
		const newTopLeftX = newPos.x - labelWidth / 2;
		const newTopLeftY = newPos.y - labelHeight / 2;

		// Only update the global store if our position has changed
		if (!currentInStore || currentInStore.x !== newTopLeftX || currentInStore.y !== newTopLeftY) {
			edgeLabelStore.updatePosition(id, newPos.x, newPos.y, labelWidth, labelHeight);
		}
	});

	// Clean up on destroy
	onDestroy(() => {
		edgeLabelStore.removePosition(id);
	});

	const customEdgePath = $derived.by(() => {
		const { x: labelX, y: labelY } = optimalLabelPosition;
		if (labelX === defaultLabelX && labelY === defaultLabelY) {
			return defaultEdgePath;
		}

		const controlX = 2 * labelX - 0.5 * (sourceX + targetX);
		const controlY = 2 * labelY - 0.5 * (sourceY + targetY);

		return `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
	});
</script>

<BaseEdge {id} path={customEdgePath} style={`stroke: ${color}; stroke-width: 1;`} />
<EdgeLabel x={optimalLabelPosition.x} y={optimalLabelPosition.y}>
	<div
		class="w-fit rounded bg-white px-1 text-xs font-medium shadow"
		style={`border: 1px solid ${color}; color: ${color};`}
	>
		{getInteractionName(label || '')}
	</div>
</EdgeLabel>
