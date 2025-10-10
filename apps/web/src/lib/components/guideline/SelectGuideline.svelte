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
		ref?: HTMLDivElement | null;
		single?: boolean;
		selectedGuidelines: number[] | number;
		title?: string;
		description?: string;
		onSubmit?: () => void;
		submitText?: string;
		disabled?: boolean;
		additionalItems?: { id: number; title: string }[];
	}

	let {
		guidelines,
		class: className = '',
		ref = $bindable(null),
		single = true,
		selectedGuidelines = $bindable(single ? -1 : []),
		title = 'Guidelines',
		description = 'Select guidelines for interaction detection',
		onSubmit,
		submitText = 'Run interaction check',
		disabled = false,
		additionalItems = []
	}: Props = $props();

	let open = $state(false);
	let triggerRef: HTMLButtonElement | null = $state(null);

	let guidelineName = $derived.by(() => {
		if (single || !Array.isArray(selectedGuidelines)) {
			if (selectedGuidelines === -1) return 'Select guideline';

			// If additionalItems are provided, check them first
			const additionalItem = additionalItems.find((item) => item.id === selectedGuidelines);
			if (additionalItem) return additionalItem.title;

			const guideline = guidelines?.find((g) => g.id === selectedGuidelines);
			return guideline ? guideline.title : 'Select guideline';
		}

		const names = selectedGuidelines.map((id) => {
			const guidline = guidelines?.find((g) => g.id === id);
			return guidline ? guidline.title : null;
		});

		if (names.length === 0) return 'Select guidelines';

		return names.filter((n) => n !== null).join(', ');
	});

	function onSelect(selectedId: number) {
		if (single || !Array.isArray(selectedGuidelines)) {
			selectedGuidelines = selectedId;
			open = false;
			triggerRef?.focus();
			return;
		}

		// Multi-select logic
		if (selectedGuidelines.includes(selectedId)) {
			selectedGuidelines = selectedGuidelines.filter((id) => id !== selectedId);
		} else {
			selectedGuidelines = [...selectedGuidelines, selectedId];
		}
	}
</script>

<Card.Root class="w-84 gap-4 p-4" bind:ref>
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
						{#if guidelines.length === 0 && additionalItems.length === 0}
							<Command.Empty class="text-muted-foreground">No guidelines found.</Command.Empty>
						{:else}
							<Command.Group>
								{#each additionalItems as item (item.id)}
									<Command.Item onSelect={() => onSelect(item.id)} class="justify-between">
										<div class="flex items-center italic">
											<CheckIcon
												class={cn(
													'mr-2 size-4',
													(single || !Array.isArray(selectedGuidelines)
														? selectedGuidelines !== item.id
														: !selectedGuidelines.includes(item.id)) && 'text-transparent'
												)}
											/>
											{item.title}
										</div>
									</Command.Item>
									<Command.Separator />
								{/each}
								{#each guidelines as guideline (guideline.id)}
									<Command.Item onSelect={() => onSelect(guideline.id)} class="justify-between">
										<div class="flex items-center">
											<CheckIcon
												class={cn(
													'mr-2 size-4',
													(single || !Array.isArray(selectedGuidelines)
														? selectedGuidelines !== guideline.id
														: !selectedGuidelines.includes(guideline.id)) && 'text-transparent'
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
		{#if onSubmit}
			<Button size="sm" variant="default" class="mt-4 w-full" {disabled} onclick={onSubmit}>
				{#if disabled}
					<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					{submitText}
				{/if}
			</Button>
		{/if}
	</Card.Content>
</Card.Root>
