interface EdgeLabelPosition {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

class EdgeLabelStore {
	private positions: Map<string, EdgeLabelPosition> = $state(new Map());

	// Update or add an edge label position with the actual position being used
	updatePosition(id: string, x: number, y: number, width: number = 80, height: number = 24) {
		this.positions.set(id, {
			id,
			x: x - width / 2,
			y: y - height / 2,
			width,
			height
		});
	}

	getPosition(id: string): EdgeLabelPosition | undefined {
		return this.positions.get(id);
	}

	// Get all positions except the specified id
	getOtherPositions(excludeId: string): EdgeLabelPosition[] {
		return Array.from(this.positions.values()).filter((pos) => pos.id !== excludeId);
	}

	// Remove a position
	removePosition(id: string) {
		this.positions.delete(id);
	}

	// Clear all positions
	clear() {
		this.positions.clear();
	}

	// Get all positions
	getAllPositions(): EdgeLabelPosition[] {
		return Array.from(this.positions.values());
	}
}

// Export singleton instance
export const edgeLabelStore = new EdgeLabelStore();
