<script lang="ts">
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import {
		PlusIcon,
		HammerIcon,
		MergeIcon,
		FileTextIcon,
		TrendingUpIcon,
		CalendarIcon,
		TargetIcon
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { RecommendationStrengthSchema } from '@repo/shared-types';

	const { data }: PageProps = $props();
	const { guidelines, recommendations } = data;

	let stats = $derived.by(() => {
		const totalGuidelines = guidelines.length;
		let recentActivity = '';

		if (guidelines.length > 0) {
			const latest = guidelines.sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			)[0];
			const date = new Date(latest.updatedAt).toLocaleDateString();
			recentActivity = `Modified "${latest.title}" on ${date}`;
		}

		const totalRecommendations = recommendations.length;
		const strengthBreakdown = recommendations.reduce(
			(acc, rec) => {
				if (rec.strength === RecommendationStrengthSchema.enum.SHOULD) acc.SHOULD += 1;
				else if (rec.strength === RecommendationStrengthSchema.enum.NOT) acc.NOT += 1;
				return acc;
			},
			{ SHOULD: 0, NOT: 0 }
		);

		return {
			totalGuidelines,
			recentActivity,
			totalRecommendations,
			strengthBreakdown
		};
	});

	// Get recent guidelines (last 5)
	const recentGuidelines = $derived(guidelines.slice(0, 5));
</script>

<div class="container mx-auto space-y-6 p-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">Hey, {data.user.name.split(' ')[0]}</h1>
		<p class="text-muted-foreground">Welcome back! Here's an overview of your guidelines.</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Guidelines Overview Card -->
		<Card.Root class="col-span-full lg:col-span-1">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Guidelines Overview</Card.Title>
				<FileTextIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.totalGuidelines}</div>
				<p class="text-xs text-muted-foreground">Total guidelines created</p>
				<div class="mt-4 space-y-2">
					<div class="flex items-center text-sm">
						<TargetIcon class="mr-2 h-3 w-3" />
						{stats.totalRecommendations} total recommendations
					</div>
					{#if stats.recentActivity}
						<div class="flex items-center text-sm text-muted-foreground">
							<CalendarIcon class="mr-2 h-3 w-3" />
							{stats.recentActivity}
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Recommendations Summary -->
		<Card.Root class="col-span-full lg:col-span-1">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Recommendations Summary</Card.Title>
				<TrendingUpIcon class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.totalRecommendations}</div>
				<p class="text-xs text-muted-foreground">Total recommendations across all guidelines</p>
				<div class="mt-4 space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm">Should</span>
						<Badge variant="default">{stats.strengthBreakdown.SHOULD}</Badge>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm">Should NOT</span>
						<Badge variant="secondary">{stats.strengthBreakdown.NOT}</Badge>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Quick Actions Panel -->
		<Card.Root class="col-span-full lg:col-span-1">
			<Card.Header>
				<Card.Title class="text-sm font-medium">Quick Actions</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<Button onclick={() => goto('/builder')} class="w-full justify-start">
					<PlusIcon class="mr-2 h-4 w-4" />
					Create New Guideline
				</Button>
				<Button variant="outline" onclick={() => goto('builder')} class="w-full justify-start">
					<HammerIcon class="mr-2 h-4 w-4" />
					Open Builder
				</Button>
				<Button variant="outline" onclick={() => goto('interactions')} class="w-full justify-start">
					<MergeIcon class="mr-2 h-4 w-4" />
					View Interactions
				</Button>
			</Card.Content>
		</Card.Root>

		<!-- Recent Guidelines Widget -->
		<Card.Root class="col-span-full">
			<Card.Header>
				<Card.Title>Recent Guidelines</Card.Title>
				<Card.Description>Your most recently created or updated guidelines</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if recentGuidelines.length === 0}
					<div class="flex h-32 items-center justify-center text-center">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">No guidelines yet</p>
							<Button size="sm" onclick={() => goto('/builder')}>
								<PlusIcon class="mr-2 h-4 w-4" />
								Create your first guideline
							</Button>
						</div>
					</div>
				{:else}
					<div class="space-y-4">
						{#each recentGuidelines as guideline, i (guideline.id)}
							<div class="flex items-center space-x-4">
								<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<FileTextIcon class="h-6 w-6 text-primary" />
								</div>
								<div class="flex-1 space-y-1">
									<button
										onclick={() => goto(`builder/${guideline.id}`)}
										class="text-left hover:underline"
									>
										<p class="text-sm leading-none font-medium">{guideline.title}</p>
									</button>
									{#if guideline.description}
										<p class="line-clamp-1 text-xs text-muted-foreground">
											{guideline.description}
										</p>
									{/if}
									<p class="text-xs text-muted-foreground">
										Updated {new Date(guideline.updatedAt).toLocaleDateString()}
									</p>
								</div>
								<Button variant="ghost" size="sm" onclick={() => goto(`builder/${guideline.id}`)}>
									Open
								</Button>
							</div>
							{#if i < recentGuidelines.length - 1}
								<Separator />
							{/if}
						{/each}

						{#if guidelines.length > 5}
							<div class="mt-4 text-center">
								<Button variant="outline" size="sm" onclick={() => goto('/builder')}>
									View all guidelines
								</Button>
							</div>
						{/if}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
