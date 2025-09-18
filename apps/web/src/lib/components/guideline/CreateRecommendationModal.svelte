<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Loader2Icon } from '@lucide/svelte';
	import { Button } from '../ui/button';
	import { Label } from '../ui/label';
	import * as Select from '../ui/select';
	import {
		RecommendationStrengthSchema,
		type RecommendationStrengthType
	} from '@repo/shared-types';
	import { invalidate } from '$app/navigation';
	import { titleCase } from './utils';
	import SnomedSelect from './SnomedSelect.svelte';

	let { open = $bindable(false), guidelineId } = $props();

	let action = $state('');
	let strength: RecommendationStrengthType | '' = $state('');

	let loading: boolean = $state(false);
	let validation: { action?: string; strength?: string } = $state({});
	let error: string | null = $state(null);

	async function handleSubmit() {
		if (action.trim().length < 3) {
			validation = { action: 'Action must be a valid SNOMED code' };
			return;
		}

		if (!strength || !RecommendationStrengthSchema.safeParse(strength).success) {
			validation = { strength: 'Valid strength is required' };
			return;
		}

		loading = true;
		validation = {};
		error = null;

		try {
			const res = await fetch('/api/recommendation', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: action.trim(), strength: strength.trim(), guidelineId })
			});

			const data = await res.json();

			if (!res.ok || res.status === 400) {
				error = data.error || 'Failed to create recommendation. Please try again.';
				return;
			}

			invalidate('app:guideline');
			open = false;
			action = '';
			strength = '';
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
			<Dialog.Title class="text-lg leading-none font-medium"
				>Create a new recommendation</Dialog.Title
			>
			<Dialog.Description class="text-sm text-muted-foreground">
				Enter the details for the new recommendation below.
			</Dialog.Description>
		</Dialog.Header>
		{#if error}
			<div class="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
		{/if}
		<form class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="action">Action</Label>
				<SnomedSelect
					bind:value={action}
					placeholder="Recommendation action (e.g., Ibuprofen)"
					class="w-full text-sm"
					disabled={loading}
				/>
				{#if validation.action}
					<p class="text-sm text-destructive">{validation.action}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="Strength">Strength</Label>
				<Select.Root type="single" bind:value={strength} disabled={loading}>
					<Select.Trigger id="strength" class="w-full" placeholder="Select strength">
						{#if strength}
							{titleCase(RecommendationStrengthSchema.parse(strength))}
						{:else}
							Select strength
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each Object.values(RecommendationStrengthSchema.enum) as option (option)}
							<Select.Item value={option}>{titleCase(option)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if validation.strength}
					<p class="text-sm text-destructive">{validation.strength}</p>
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
