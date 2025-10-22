<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { authClient } from '$lib/auth';
	import { impersonationStore } from '$lib/stores/ImpersonationStore.svelte';

	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Separator } from '$lib/components/ui/separator';

	import UserXIcon from '@lucide/svelte/icons/user-x';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import UserIcon from '@lucide/svelte/icons/user';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import MailIcon from '@lucide/svelte/icons/mail';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';

	import type { PageData } from './$types';
	import type { DateValue } from '@internationalized/date';

	let { data }: { data: PageData } = $props();

	let showBanDialog = $state(false);
	let showUnbanDialog = $state(false);
	let showDeleteDialog = $state(false);
	let showVerifyDialog = $state(false);
	let showImpersonateDialog = $state(false);
	let showToggleRoleDialog = $state(false);

	let banReason = $state(data.user.banReason || '');
	let banExpiresDate = $state<DateValue | undefined>();
	let showBanCalendar = $state(false);

	let error = $state<string | null>(null);
	let actionLoading = $state(false);

	async function handleBanUser() {
		actionLoading = true;
		error = null;

		const response = await authClient.admin.banUser({
			userId: data.user.id,
			banReason: banReason.trim() || undefined,
			banExpiresIn: banExpiresDate
				? Math.floor((banExpiresDate.toDate('UTC').getTime() - Date.now()) / 1000)
				: undefined
		});

		if (response.error) {
			error = response.error.message || 'Failed to ban user';
			actionLoading = false;
			showBanDialog = false;
			return;
		}

		showBanDialog = false;
		banReason = '';
		banExpiresDate = undefined;
		await invalidate('app:admin-user');
		actionLoading = false;
	}

	async function handleUnbanUser() {
		actionLoading = true;
		error = null;

		const response = await authClient.admin.unbanUser({
			userId: data.user.id
		});

		if (response.error) {
			error = response.error.message || 'Failed to unban user';
			actionLoading = false;
			showUnbanDialog = false;
			return;
		}

		showUnbanDialog = false;
		await invalidate('app:admin-user');
		actionLoading = false;
	}

	async function handleDeleteUser() {
		actionLoading = true;
		error = null;

		const response = await authClient.admin.removeUser({
			userId: data.user.id
		});

		if (response.error) {
			error = response.error.message || 'Failed to delete user';
			actionLoading = false;
			showDeleteDialog = false;
			return;
		}

		showDeleteDialog = false;
		goto('/admin/users');
		actionLoading = false;
	}

	async function handleVerifyEmail() {
		actionLoading = true;
		error = null;

		const response = await authClient.admin.updateUser({
			userId: data.user.id,
			data: { emailVerified: true }
		});

		if (response.error) {
			error = response.error.message || 'Failed to verify email';
			actionLoading = false;
			showVerifyDialog = false;
			return;
		}

		showVerifyDialog = false;
		await invalidate('app:admin-user');
		actionLoading = false;
	}

	async function handleImpersonate() {
		actionLoading = true;
		error = null;

		const response = await authClient.admin.impersonateUser({
			userId: data.user.id
		});

		if (response.error) {
			error = response.error?.message || 'Failed to impersonate user';
			actionLoading = false;
			showImpersonateDialog = false;
			return;
		}

		impersonationStore.setImpersonatedUser(data.user.id);
		await invalidate('app:user');
		showImpersonateDialog = false;
		goto('/dashboard');
		actionLoading = false;
	}

	async function handleToggleRole() {
		actionLoading = true;
		error = null;

		const response = await authClient.admin.setRole({
			userId: data.user.id,
			role: data.user.role === 'admin' ? 'user' : 'admin'
		});

		if (response.error) {
			error = response.error.message || 'Failed to update user role';
			showToggleRoleDialog = false;
			actionLoading = false;
			return;
		}

		await invalidate('app:admin-user');
		actionLoading = false;
		showToggleRoleDialog = false;
	}

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
	<div class="flex w-full items-center justify-end">
		<Button variant="outline" onclick={() => goto('/admin/users')}>Back to user list</Button>
	</div>

	{#if error}
		<div class="rounded-md bg-destructive/10 p-4 text-sm text-destructive-foreground">
			{error}
		</div>
	{/if}

	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<div class="flex items-start gap-4">
					<Avatar.Root class="size-16">
						<Avatar.Fallback class="bg-sidebar-border text-lg">
							{getUserInitials(data.user.name)}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<h2 class="text-2xl font-semibold">{data.user.name}</h2>
							<Badge variant={data.user.role === 'admin' ? 'default' : 'secondary'}>
								{data.user.role || 'user'}
							</Badge>
						</div>
						<p class="text-sm text-muted-foreground">{data.user.email}</p>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-4">
					<Separator />
					<div>
						<h3 class="mb-3 text-sm font-medium">Account Status</h3>
						<div class="flex flex-wrap gap-2">
							{#if data.user.banned}
								<Badge variant="destructive" class="gap-1">
									<UserXIcon class="size-3" />
									Banned
								</Badge>
							{:else}
								<Badge variant="secondary" class="gap-1">
									<ShieldIcon class="size-3" />
									Active
								</Badge>
							{/if}
							{#if data.user.emailVerified}
								<Badge variant="outline" class="gap-1">
									<CheckCircleIcon class="size-3" />
									Email Verified
								</Badge>
							{:else}
								<Badge variant="outline" class="gap-1 text-muted-foreground">
									Email Unverified
								</Badge>
							{/if}
						</div>
					</div>

					<Separator />

					<!-- Details Section -->
					<div class="grid gap-3">
						<h3 class="text-sm font-medium">Details</h3>
						<div class="grid gap-2 text-sm">
							<div class="flex items-center gap-2">
								<MailIcon class="size-4 text-muted-foreground" />
								<span class="text-muted-foreground">User ID:</span>
								<span class="font-mono">{data.user.id}</span>
							</div>
							<div class="flex items-center gap-2">
								<CalendarIcon class="size-4 text-muted-foreground" />
								<span class="text-muted-foreground">Joined:</span>
								<span>{data.user.createdAt.toLocaleDateString()}</span>
							</div>
							<div class="flex items-center gap-2">
								<CalendarIcon class="size-4 text-muted-foreground" />
								<span class="text-muted-foreground">Last Updated:</span>
								<span>{data.user.updatedAt.toLocaleDateString()}</span>
							</div>
							{#if data.user.role === 'admin'}
								<div class="flex items-center gap-2">
									<ShieldCheckIcon class="size-4 text-muted-foreground" />
									<span class="text-muted-foreground">Role:</span>
									<span>Administrator</span>
								</div>
							{/if}
						</div>
					</div>

					{#if data.user.banned}
						<Separator />
						<div class="grid gap-3">
							<h3 class="text-sm font-medium text-destructive">Ban Information</h3>
							<div class="grid gap-2 text-sm">
								{#if data.user.banReason}
									<div class="flex items-center gap-2">
										<ShieldIcon class="size-4 text-muted-foreground" />
										<span class="text-muted-foreground">Reason:</span>
										<div class="text-destructive">{data.user.banReason}</div>
									</div>
								{/if}
								{#if data.user.banExpires}
									<div class="flex items-center gap-2">
										<CalendarIcon class="size-4 text-muted-foreground" />
										<span class="text-muted-foreground">Expires:</span>
										<span
											>{data.user.banExpires
												? data.user.banExpires.toLocaleDateString()
												: 'Never'}</span
										>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Actions -->
		<Card.Root class="md:col-span-1">
			<Card.Header>
				<Card.Title>Actions</Card.Title>
				<Card.Description>Manage this user's account</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-2">
					{#if data.user.banned}
						<Button variant="default" class="w-full" onclick={() => (showUnbanDialog = true)}>
							<ShieldIcon class="size-4" />
							Unban User
						</Button>
					{:else}
						<Button variant="destructive" class="w-full" onclick={() => (showBanDialog = true)}>
							<UserXIcon class="size-4" />
							Ban User
						</Button>
					{/if}

					{#if !data.user.emailVerified}
						<Button variant="outline" class="w-full" onclick={() => (showVerifyDialog = true)}>
							<CheckCircleIcon class="size-4" />
							Verify Email
						</Button>
					{/if}

					<Button variant="outline" class="w-full" onclick={() => (showToggleRoleDialog = true)}>
						<ShieldCheckIcon class="size-4" />
						{data.user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
					</Button>

					<Button variant="outline" class="w-full" onclick={() => (showImpersonateDialog = true)}>
						<UserIcon class="size-4" />
						Impersonate User
					</Button>

					<Separator class="my-2" />

					<Button
						variant="outline"
						class="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
						onclick={() => (showDeleteDialog = true)}
					>
						<TrashIcon class="size-4" />
						Delete User
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<!-- Ban User Dialog -->
<Dialog.Root bind:open={showBanDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Ban User</Dialog.Title>
			<Dialog.Description>
				Ban {data.user.name} ({data.user.email})
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label>Reason (optional)</Label>
				<Textarea bind:value={banReason} placeholder="Enter reason for ban..." rows={3} />
			</div>
			<div class="grid gap-2">
				<Label>Expires (optional)</Label>
				<Popover.Root bind:open={showBanCalendar}>
					<Popover.Trigger>
						<Button variant="outline" class="justify-start">
							{banExpiresDate ? banExpiresDate.toDate('UTC').toLocaleDateString() : 'Select date'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar type="single" bind:value={banExpiresDate} />
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showBanDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleBanUser} disabled={actionLoading}>
				{#if actionLoading}
					<Loader2Icon class="animate-spin" />
				{:else}
					Ban User
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Unban User Dialog -->
<Dialog.Root bind:open={showUnbanDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Unban User</Dialog.Title>
			<Dialog.Description>
				Remove ban from {data.user.name} ({data.user.email})?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showUnbanDialog = false)}>Cancel</Button>
			<Button onclick={handleUnbanUser} disabled={actionLoading}>
				{#if actionLoading}
					<Loader2Icon class="animate-spin" />
				{:else}
					Unban User
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete User Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete User</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to permanently delete {data.user.name} ({data.user.email})? This
				action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleDeleteUser} disabled={actionLoading}>
				{#if actionLoading}
					<Loader2Icon class="animate-spin" />
				{:else}
					Delete User
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Verify Email Dialog -->
<Dialog.Root bind:open={showVerifyDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Verify Email</Dialog.Title>
			<Dialog.Description>Mark {data.user.email} as verified?</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showVerifyDialog = false)}>Cancel</Button>
			<Button onclick={handleVerifyEmail} disabled={actionLoading}>
				{#if actionLoading}
					<Loader2Icon class="animate-spin" />
				{:else}
					Verify Email
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Impersonate User Dialog -->
<Dialog.Root bind:open={showImpersonateDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Impersonate User</Dialog.Title>
			<Dialog.Description>
				Impersonate {data.user.name} ({data.user.email})? You will be logged in as this user.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showImpersonateDialog = false)}>Cancel</Button>
			<Button onclick={handleImpersonate} disabled={actionLoading}>
				{#if actionLoading}
					<Loader2Icon class="animate-spin" />
				{:else}
					Impersonate
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!--- Toggle Role Dialog --->
<Dialog.Root bind:open={showToggleRoleDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Change User Role</Dialog.Title>
			<Dialog.Description>
				Change role of {data.user.name} ({data.user.email}) to
				{data.user.role === 'admin' ? ' user' : ' admin'}?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showImpersonateDialog = false)}>Cancel</Button>
			<Button onclick={handleToggleRole} disabled={actionLoading}>
				{#if actionLoading}
					<Loader2Icon class="animate-spin" />
				{:else}
					Change Role
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
