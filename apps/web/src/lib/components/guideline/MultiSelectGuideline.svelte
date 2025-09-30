<script lang="ts">
	import { Loader2Icon, CheckIcon, ChevronsUpDownIcon } from '@lucide/svelte';

	import * as Card from '$lib/components/ui/card';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	import type { Guideline } from '@repo/shared-types';

	interface Props {
		guidelines: Guideline[];
		class?: string;
		selectedGuidelines: number[];
		title?: string;
		description?: string;
		onSubmit?: () => void;
		submitText?: string;
		disabled?: boolean;
	}

	let {
		guidelines,
		class: className = '',
		selectedGuidelines = $bindable([]),
		title = 'Guidelines',
		description = 'Select guidelines for interaction detection',
		onSubmit,
		submitText = 'Run interaction check',
		disabled = false
	}: Props = $props();

	let open = $state(false);
	let triggerRef: HTMLButtonElement | null = $state(null);

	let guidelineName = $derived.by(() => {
		const names = selectedGuidelines.map((id) => {
			const guidline = guidelines?.find((g) => g.id === id);
			return guidline ? guidline.title : null;
		});

		if (names.length === 0) return 'Select guidelines';

		return names.filter((n) => n !== null).join(', ');
	});
</script>

<Card.Root class="absolute top-2 left-2 w-84 gap-4 p-4">
	<Card.Header class="p-0">
		<Card.Title class="text-secondary-foreground">{title}</Card.Title>
		<Card.Description>{description}</Card.Description>
	</Card.Header>
	<Card.Content class="px-0">
		<Popover.Root bind:open>
			<Popover.Trigger bind:ref={triggerRef}>
				{#snippet child({ props })}
					<Button
						variant="outline"
						{...props}
						class={cn(
							'w-full justify-between text-left font-normal',
							guidelineName ? 'text-secondary-foreground' : 'text-muted-foreground',
							className
						)}
						role="combobox"
						aria-expanded={open}
						{disabled}
					>
						<div class="overflow-hidden text-ellipsis whitespace-nowrap">{guidelineName}</div>
						<ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[var(--bits-popover-anchor-width)] p-0 text-muted-foreground">
				<Command.Root shouldFilter={true} class="p-0">
					<Command.Input placeholder="Search guidelines" class="mt-1 border-none focus:ring-0" />
					<Command.List>
						{#if guidelines.length === 0}
							<Command.Empty class="text-muted-foreground">No guidelines found.</Command.Empty>
						{:else}
							<Command.Group>
								{#each guidelines as guideline (guideline.id)}
									<Command.Item
										onSelect={() => {
											if (selectedGuidelines.includes(guideline.id)) {
												selectedGuidelines = selectedGuidelines.filter((id) => id !== guideline.id);
											} else {
												selectedGuidelines = [...selectedGuidelines, guideline.id];
											}
										}}
										class="justify-between"
									>
										<div class="flex items-center">
											<CheckIcon
												class={cn(
													'mr-2 size-4',
													!selectedGuidelines.includes(guideline.id) && 'text-transparent'
												)}
											/>
											{guideline.title}
										</div>
									</Command.Item>
								{/each}
							</Command.Group>
						{/if}
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<Button size="sm" variant="default" class="mt-4 w-full" {disabled} onclick={onSubmit}>
			{#if disabled}
				<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				{submitText}
			{/if}
		</Button>
	</Card.Content>
</Card.Root>
