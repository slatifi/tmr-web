<script lang="ts">
	import { fetchSnomedData, type SnomedExpansionResponse } from '$lib/stores/SnomedStore.svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';

	let {
		rootCode = '138875005',
		class: className = '',
		value = $bindable(''),
		disabled = false,
		placeholder = 'Select a SNOMED code'
	} = $props();

	let searchTerm = $state('');
	let open = $state(false);
	let triggerRef: HTMLButtonElement | null = $state(null);
	let results = $state<{ code: string; display: string; tag: string }[]>([]);

	$effect(() => {
		if (searchTerm.length < 2) {
			results = [];
			return;
		}
		// Before fetching, to prevent too many requests, wait for 300ms of no changes
		const beforeValue = searchTerm;

		const timeout = setTimeout(() => {
			if (beforeValue === searchTerm) {
				const url = generateSearchURL(searchTerm);
				fetchSnomedData<SnomedExpansionResponse>(url).then((data) => {
					if (data && data.expansion && data.expansion.contains) {
						results = formatCodes(data.expansion.contains);
					} else {
						results = [];
					}
				});
			}
		}, 300);
		return () => clearTimeout(timeout);
	});

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}

	const selectedValue = $derived.by(() => {
		return results.find((r) => r.code === value)?.display;
	});

	function generateSearchURL(term: string, count: number = 10) {
		const baseUrl = `/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=isa/${rootCode}`;
		const params = new URLSearchParams({
			count: count.toString(),
			filter: term,
			includeDesignations: 'true'
		});
		return `${baseUrl}&${params.toString()}`;
	}

	function formatCodes(codes: SnomedExpansionResponse['expansion']['contains']) {
		return codes.map((item) => {
			let tag = '';
			if (item.designation && item.designation.length > 0) {
				const desig = item.designation.find((d) => d.use && d.use.code === '900000000000003001'); // Extract the code type
				tag = desig?.value.substring(desig.value.indexOf('(')).slice(1, -1) || '';
			}
			return { code: item.code, display: item.display, tag };
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef} {disabled}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				{...props}
				class={cn(
					'justify-between font-normal',
					selectedValue ? 'text-foreground' : 'text-muted-foreground',
					className
				)}
				role="combobox"
				aria-expanded={open}
			>
				{selectedValue || placeholder}
				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[var(--bits-popover-anchor-width)] p-0 text-muted-foreground">
		<Command.Root shouldFilter={false} class="p-0">
			<Command.Input
				class="mt-1 border-none focus:ring-0"
				bind:value={searchTerm}
				placeholder="Search SNOMED"
			/>
			<Command.List>
				<Command.Empty class="text-muted-foreground">No codes found.</Command.Empty>
				<Command.Group>
					{#each results as result (result.code)}
						<Command.Item
							value={result.code}
							class="justify-between"
							onSelect={() => {
								value = result.code;
								closeAndFocusTrigger();
							}}
						>
							<div class="flex items-center">
								<CheckIcon class={cn('mr-2 size-4', value !== result.code && 'text-transparent')} />
								{result.display}
							</div>
							{#if result.tag}
								<span class="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
									{result.tag}
								</span>
							{/if}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
