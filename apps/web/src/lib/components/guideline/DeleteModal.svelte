<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Loader2Icon, Trash2Icon } from '@lucide/svelte';
	import { invalidate } from '$app/navigation';

	let {
		open = $bindable(false),
		resourceType,
		resourceId,
		resourceTitle,
		onDelete,
		invalidationRoute = ''
	}: {
		open?: boolean;
		resourceType: string;
		resourceId?: number;
		resourceTitle?: string;
		onDelete?: () => void;
		invalidationRoute?: string;
	} = $props();

	let loading = $state(false);
	let error: string | null = $state(null);

	async function handleDelete() {
		if (!resourceId) return;
		loading = true;
		error = null;

		try {
			const res = await fetch(`/api/${resourceType}/${resourceId}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const resData = await res.json();
				error = resData.message || `Failed to delete ${resourceType}. Please try again.`;
				loading = false;
				return;
			}
			invalidate(`app:${invalidationRoute || resourceType + 's'}`);
			onDelete?.();
			open = false;
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root {open}>
	<Dialog.Overlay class="fixed inset-0 bg-black/50" />
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-lg leading-none font-medium capitalize"
				>Delete {resourceType}</Dialog.Title
			>
		</Dialog.Header>
		<div class="mt-3 text-sm text-secondary-foreground">
			{#if error}
				<div class="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
			{/if}
			Are you sure you want to delete the {resourceType} "<strong class="inline"
				>{resourceTitle}</strong
			>"? This action cannot be undone.
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={loading}>Cancel</Button>
			<Button
				variant="destructive"
				onclick={handleDelete}
				disabled={loading}
				class="flex items-center"
			>
				{#if loading}
					<Loader2Icon class="h-4 w-4 animate-spin" />
				{:else}
					<Trash2Icon class="h-4 w-4" />
				{/if}
				Delete
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
