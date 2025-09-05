<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Loader2Icon } from '@lucide/svelte';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';

	let { open = $bindable(false), handleCreation } = $props();

	let title = $state('');
	let description = $state('');

	let loading: boolean = $state(false);
	let validation: { title?: string; description?: string } = $state({});
	let error: string | null = $state(null);

	async function handleSubmit() {
		if (title.trim().length < 3) {
			validation = { title: 'Title must be greater than 3 characters' };
			return;
		}

		loading = true;
		validation = {};
		error = null;

		try {
			const res = await fetch('/api/guideline', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: title.trim(), description: description.trim() })
			});

			const data = await res.json();

			if (!res.ok || res.status === 400) {
				error = data.error || 'Failed to create guideline. Please try again.';
				return;
			}

			open = false;
			title = '';
			description = '';

			if (handleCreation && data.id) {
				handleCreation(data.id);
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="text-lg leading-none font-medium">Create a new guideline</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Enter the details for your new guideline below.
			</Dialog.Description>
		</Dialog.Header>
		{#if error}
			<div class="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
		{/if}
		<form class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="title">Title</Label>
				<Input
					id="title"
					type="text"
					bind:value={title}
					placeholder="Guideline title"
					class="w-full"
					required
					disabled={loading}
				/>
				{#if validation.title}
					<p class="text-sm text-destructive">{validation.title}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="description">Description (optional)</Label>
				<Input
					id="description"
					type="text"
					bind:value={description}
					placeholder="Brief description of the guideline"
					class="w-full"
					disabled={loading}
				/>
				{#if validation.description}
					<p class="text-sm text-destructive">{validation.description}</p>
				{/if}
			</div>
		</form>
		<Dialog.Footer>
			<Button variant="outline" disabled={loading} onclick={() => (open = false)}>Cancel</Button>
			<Button disabled={loading} onclick={handleSubmit}>
				{#if loading}
					<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Create
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
