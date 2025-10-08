<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { updateUser, changePassword } from '$lib/auth/client';

	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import type { PageProps } from './$types';

	let name: string = $state('');

	let currentPassword: string = $state('');
	let newPassword: string = $state('');
	let confirmPassword: string = $state('');

	let nameError: string = $state('');
	let passwordError: string = $state('');
	let nameSuccess: string = $state('');
	let passwordSuccess: string = $state('');

	let nameLoading: boolean = $state(false);
	let passwordLoading: boolean = $state(false);

	let nameValidation: { name?: string } = $state({});
	let passwordValidation: {
		currentPassword?: string;
		newPassword?: string;
		confirmPassword?: string;
	} = $state({});

	const { data }: PageProps = $props();
	const user = data.user;

	$effect(() => {
		if (data.user?.name) {
			name = data.user.name;
		}
	});

	async function handleNameUpdate(e: Event) {
		e.preventDefault();

		nameError = '';
		nameSuccess = '';
		nameValidation = {};

		// Validate name
		if (typeof name !== 'string' || name.trim() === '' || name.length < 3) {
			nameValidation = { name: 'Name must be at least 3 characters long.' };
			return;
		}

		nameLoading = true;

		const response = await updateUser({ name: name.trim() });

		if (response.error) {
			nameError = response.error.message || 'Failed to update name';
			nameLoading = false;
			return;
		}
		nameSuccess = 'Name updated successfully';
		invalidate('app:user');
		nameLoading = false;
	}

	async function handlePasswordUpdate(e: Event) {
		e.preventDefault();

		passwordError = '';
		passwordSuccess = '';
		passwordValidation = {};

		// Validate current password
		if (typeof currentPassword !== 'string' || currentPassword.trim() === '') {
			passwordValidation = {
				...passwordValidation,
				currentPassword: 'Current password is required.'
			};
		}

		// Validate new password
		if (typeof newPassword !== 'string' || newPassword.length < 8) {
			passwordValidation = {
				...passwordValidation,
				newPassword: 'New password must be at least 8 characters long.'
			};
		}

		// Validate confirm password
		if (newPassword !== confirmPassword) {
			passwordValidation = { ...passwordValidation, confirmPassword: 'Passwords do not match.' };
		}

		if (passwordValidation && Object.keys(passwordValidation).length > 0) {
			return;
		}

		passwordLoading = true;

		const response = await changePassword({
			currentPassword: currentPassword,
			newPassword: newPassword,
			revokeOtherSessions: true
		});

		if (response.error) {
			passwordError = response.error.message || 'Failed to update password';
			passwordLoading = false;
			return;
		}

		passwordSuccess = 'Password updated successfully';
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
		invalidate('app:user');
		passwordLoading = false;
	}
</script>

<div class="container mx-auto max-w-2xl space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-semibold tracking-tight">Account Settings</h1>
		<Button variant="outline" onclick={() => goto('/dashboard')}>Back to dashboard</Button>
	</div>

	<!-- Account Information -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Account Information</Card.Title>
			<Card.Description>Your account details</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if nameError}
				<div class="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
					{nameError}
				</div>
			{/if}
			{#if nameSuccess}
				<div class="mb-4 rounded-md bg-sidebar-accent p-4 text-sm text-sidebar-accent-foreground">
					{nameSuccess}
				</div>
			{/if}
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label>Email Address</Label>
					<Input type="email" value={user?.email || ''} disabled class="bg-muted" />
					<span class="text-sm text-muted-foreground">
						Email cannot be changed. Contact support if you need to update your email address.
					</span>
				</div>
				<form onsubmit={handleNameUpdate}>
					<div class="grid gap-4">
						<div class="grid gap-2">
							<Label for="name">Full Name</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="John Doe"
								bind:value={name}
								disabled={nameLoading}
								required
							/>
							{#if nameValidation?.name}
								<span class="text-sm text-destructive">{nameValidation.name}</span>
							{/if}
						</div>
						<Button type="submit" disabled={nameLoading} class="w-full">
							{#if nameLoading}
								<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Update Name
						</Button>
					</div>
				</form>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Update Password Section -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Change Password</Card.Title>
			<Card.Description>Update your account password</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if passwordError}
				<div class="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
					{passwordError}
				</div>
			{/if}
			{#if passwordSuccess}
				<div class="mb-4 rounded-md bg-sidebar-accent p-4 text-sm text-sidebar-accent-foreground">
					{passwordSuccess}
				</div>
			{/if}
			<form onsubmit={handlePasswordUpdate}>
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="current-password">Current Password</Label>
						<Input
							id="current-password"
							name="current-password"
							type="password"
							bind:value={currentPassword}
							disabled={passwordLoading}
							required
						/>
						{#if passwordValidation?.currentPassword}
							<span class="text-sm text-destructive">{passwordValidation.currentPassword}</span>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label for="new-password">New Password</Label>
						<Input
							id="new-password"
							name="new-password"
							type="password"
							bind:value={newPassword}
							disabled={passwordLoading}
							required
						/>
						{#if passwordValidation?.newPassword}
							<span class="text-sm text-destructive">{passwordValidation.newPassword}</span>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label for="confirm-password">Confirm New Password</Label>
						<Input
							id="confirm-password"
							name="confirm-password"
							type="password"
							bind:value={confirmPassword}
							disabled={passwordLoading}
							required
						/>
						{#if passwordValidation?.confirmPassword}
							<span class="text-sm text-destructive">{passwordValidation.confirmPassword}</span>
						{/if}
					</div>
					<Button type="submit" disabled={passwordLoading} class="w-full">
						{#if passwordLoading}
							<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Update Password
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
