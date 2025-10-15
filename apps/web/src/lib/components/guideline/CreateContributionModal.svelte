<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Loader2Icon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import {
		ContributionValueSchema,
		type ContributionValueType,
		DerivativeSchema,
		type DerivativeType,
		SituationSchema,
		type SituationType
	} from '@repo/shared-types';
	import { invalidate } from '$app/navigation';
	import { titleCase, calculateDerivative } from './utils';
	import SnomedSelect from './SnomedSelect.svelte';
	import { fetchWithCredentials } from '$lib/utils';

	let { open = $bindable(false), recommendationId } = $props();

	let value: ContributionValueType | '' = $state('');
	let property = $state('');
	let derivative: DerivativeType | '' = $state('');
	let preSituation: SituationType | '' = $state('');
	let postSituation: SituationType | '' = $state('');

	// Whether the derivative should be calculated automatically
	let canCalculateDerivative = $derived(
		preSituation &&
			postSituation &&
			preSituation !== SituationSchema.enum.UNKNOWN &&
			postSituation !== SituationSchema.enum.UNKNOWN
	);

	// If calculateDerivative is true, automatically set the derivative based on situations
	$effect(() => {
		if (canCalculateDerivative && preSituation && postSituation)
			derivative = calculateDerivative(preSituation, postSituation);
	});

	let loading: boolean = $state(false);
	let validation: {
		value?: string;
		property?: string;
		derivative?: string;
		preSituation?: string;
		postSituation?: string;
	} = $state({});
	let error: string | null = $state(null);

	async function handleSubmit() {
		const newValidation: typeof validation = {};

		if (!value || !ContributionValueSchema.safeParse(value).success) {
			newValidation.value = 'Valid value is required';
		}
		if (property.trim().length < 2) {
			newValidation.property = 'Property must be a valid SNOMED code';
		}
		if (!derivative || !DerivativeSchema.safeParse(derivative).success) {
			newValidation.derivative = 'Valid derivative is required';
		}
		if (!preSituation || !SituationSchema.safeParse(preSituation).success) {
			newValidation.preSituation = 'Valid pre-situation is required';
		}
		if (!postSituation || !SituationSchema.safeParse(postSituation).success) {
			newValidation.postSituation = 'Valid post-situation is required';
		}

		validation = newValidation;
		if (Object.keys(newValidation).length > 0) return;

		loading = true;
		validation = {};
		error = null;

		try {
			const res = await fetchWithCredentials('/api/contribution/with-transition', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					value,
					property: property.trim(),
					derivative,
					pre: preSituation,
					post: postSituation,
					recommendationId
				})
			});

			const data = await res.json();

			if (!res.ok || res.status === 400) {
				error = data.error || 'Failed to create contribution. Please try again.';
				return;
			}

			invalidate('app:guideline');
			open = false;
			value = '';
			property = '';
			derivative = '';
			preSituation = '';
			postSituation = '';
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
			<Dialog.Title class="text-lg leading-none font-medium">Create a new contribution</Dialog.Title
			>
			<Dialog.Description class="text-sm text-muted-foreground">
				Enter the details for the new contribution below.
			</Dialog.Description>
		</Dialog.Header>
		{#if error}
			<div class="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
		{/if}
		<form class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="value">Contribution Value</Label>
				<Select.Root type="single" bind:value disabled={loading}>
					<Select.Trigger id="value" class="w-full" placeholder="Select value">
						{#if value}
							{titleCase(ContributionValueSchema.parse(value))}
						{:else}
							Select value
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each Object.values(ContributionValueSchema.enum) as option (option)}
							<Select.Item value={option}>{titleCase(option)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if validation.value}
					<p class="text-sm text-destructive">{validation.value}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="property">Property</Label>
				<SnomedSelect
					bind:value={property}
					placeholder="Property"
					class="w-full text-sm"
					disabled={loading}
				/>
				{#if validation.property}
					<p class="text-sm text-destructive">{validation.property}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="preSituation">Pre-situation</Label>
				<Select.Root type="single" bind:value={preSituation} disabled={loading}>
					<Select.Trigger id="preSituation" class="w-full" placeholder="Select pre-situation">
						{#if preSituation}
							{titleCase(SituationSchema.parse(preSituation))}
						{:else}
							Select pre-situation
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each Object.values(SituationSchema.enum) as option (option)}
							<Select.Item value={option}>{titleCase(option)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if validation.preSituation}
					<p class="text-sm text-destructive">{validation.preSituation}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="postSituation">Post-situation</Label>
				<Select.Root type="single" bind:value={postSituation} disabled={loading}>
					<Select.Trigger id="postSituation" class="w-full" placeholder="Select post-situation">
						{#if postSituation}
							{titleCase(SituationSchema.parse(postSituation))}
						{:else}
							Select post-situation
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each Object.values(SituationSchema.enum) as option (option)}
							<Select.Item value={option}>{titleCase(option)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if validation.postSituation}
					<p class="text-sm text-destructive">{validation.postSituation}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="derivative">Derivative</Label>
				<Select.Root
					type="single"
					bind:value={derivative}
					disabled={canCalculateDerivative || loading}
				>
					<Select.Trigger id="derivative" class="w-full" placeholder="Select derivative">
						{#if derivative}
							{titleCase(DerivativeSchema.parse(derivative))}
						{:else}
							Select derivative
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each Object.values(DerivativeSchema.enum) as option (option)}
							<Select.Item class="capitalize" value={option}>{titleCase(option)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if validation.derivative}
					<p class="text-sm text-destructive">{validation.derivative}</p>
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
