<script lang="ts">
	import { resetPassword } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import type { PageProps } from './$types';

	let password = $state<string>('');
	let confirm = $state<string>('');
	let validation = $state<{
		password?: string;
		confirm?: string;
	}>({});
	let error = $state<string | undefined>(undefined);
	let loading = $state<boolean>(false);

	let { data }: PageProps = $props();

	async function handleSubmit(event: Event) {
		event.preventDefault();
		validation = {};

		if (typeof password !== 'string' || password.length < 8) {
			validation = { ...validation, password: 'Password must be at least 8 characters long.' };
		}

		// Validate confirm password
		if (password !== confirm) {
			validation = { ...validation, confirm: 'Passwords do not match.' };
		}

		if (Object.keys(validation).length > 0) {
			return;
		}

		// Login with Better Auth
		loading = true;
		const result = await resetPassword({ newPassword: password, token: data.token });
		if (result.error) {
			error = result.error.message;
			loading = false;
			return;
		}

		goto('/login?reset=true');
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Reset your password</Card.Title>
		<Card.Description>Please enter your new password below.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if error}
			<div class="mb-5 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
				{error}
			</div>
		{/if}
		<form onsubmit={handleSubmit}>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label>Password</Label>
					</div>
					<Input
						name="password"
						type="password"
						bind:value={password}
						required
						disabled={loading}
					/>
					{#if validation?.password}
						<span class="text-sm text-destructive">{validation.password}</span>
					{/if}
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label>Confirm Password</Label>
					</div>
					<Input name="confirm" type="password" bind:value={confirm} required disabled={loading} />
					{#if validation?.confirm}
						<span class="text-sm text-destructive">{validation.confirm}</span>
					{/if}
				</div>
				<Button type="submit" class="w-full">
					{#if loading}
						<Loader2Icon class="animate-spin" />
					{:else}
						Reset Password
					{/if}
				</Button>
			</div>
		</form>
		<div class="mt-6 flex items-center justify-center gap-2">
			<Button variant="link" href="/login" class="px-0">Back to login</Button>
		</div>
	</Card.Content>
</Card.Root>
