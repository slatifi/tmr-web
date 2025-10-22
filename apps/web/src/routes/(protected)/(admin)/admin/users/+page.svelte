<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import UserXIcon from '@lucide/svelte/icons/user-x';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pageSize = 10;

	const totalPages = $derived(Math.ceil(data.total / 10));

	function getUserInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">User Management</h1>
			<p class="text-sm text-muted-foreground">Manage and monitor all users in the system</p>
		</div>
	</div>

	<Card.Root class="h-full">
		<Card.Content>
			<div class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>User</Table.Head>
							<Table.Head>Email</Table.Head>
							<Table.Head>Role</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Joined</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.users as user (user.id)}
							<Table.Row
								class="cursor-pointer hover:bg-muted/50"
								onclick={() => goto(`/admin/users/${user.email}`)}
							>
								<Table.Cell>
									<div class="flex items-center gap-3">
										<Avatar.Root class="size-10">
											<Avatar.Fallback class="bg-sidebar-border">
												{getUserInitials(user.name)}
											</Avatar.Fallback>
										</Avatar.Root>
										<span class="font-medium">{user.name}</span>
									</div>
								</Table.Cell>
								<Table.Cell>{user.email}</Table.Cell>
								<Table.Cell>
									<Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
										{user.role || 'user'}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col gap-1">
										{#if user.banned}
											<Badge variant="destructive" class="w-fit">
												<UserXIcon class="mr-1 size-3" />
												Banned
											</Badge>
										{:else}
											<Badge variant="secondary" class="w-fit">
												<ShieldIcon class="mr-1 size-3" />
												Active
											</Badge>
										{/if}
										{#if user.emailVerified}
											<Badge variant="outline" class="w-fit">
												<CheckCircleIcon class="mr-1 size-3" />
												Verified
											</Badge>
										{:else}
											<Badge variant="outline" class="w-fit text-muted-foreground">
												Unverified
											</Badge>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>{user.createdAt.toLocaleDateString()}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<!-- Pagination -->
			<div class="mt-4 flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					Showing {(data.currentPage - 1) * pageSize + 1} to {Math.min(
						data.currentPage * pageSize,
						data.total
					)} of {data.total} users
				</p>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={data.currentPage === 1}
						onclick={() => goto('admin/users?page=' + (data.currentPage - 1))}
					>
						<ChevronLeftIcon class="size-4" />
						Previous
					</Button>
					<span class="text-sm text-muted-foreground">
						Page {data.currentPage} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={data.currentPage === totalPages}
						onclick={() => goto('admin/users?page=' + (data.currentPage + 1))}
					>
						Next
						<ChevronRightIcon class="size-4" />
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
