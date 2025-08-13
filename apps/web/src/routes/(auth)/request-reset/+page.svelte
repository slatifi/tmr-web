<script lang="ts">
	import { requestPasswordReset } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';

	let email = $state<string>('');
	let loading = $state<boolean>(false);
	let validation = $state<{ email?: string } | null>(null);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
			validation = { email: 'Please enter a valid email address.' };
			return;
		}

		loading = true;
		const result = await requestPasswordReset({ email, redirectTo: '/reset-password' });
		if (result.error) {
			error = result.error.message;
			validation = null;
			loading = false;
			return;
		}

		goto('/login?request=true');
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Request Password Reset</Card.Title>
		<Card.Description>Enter your email below to reset your password.</Card.Description>
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
					<Label>Email</Label>
					<Input
						name="email"
						type="email"
						placeholder="me@example.com"
						bind:value={email}
						required
						disabled={loading}
					/>
					{#if validation?.email}
						<span class="text-sm text-destructive">{validation.email}</span>
					{/if}
				</div>
				<Button type="submit" class="w-full" disabled={loading}>
					{#if loading}
						<Loader2Icon class="animate-spin" />
					{:else}
						Request Password Reset
					{/if}
				</Button>
			</div>
		</form>
		<div class="mt-6 flex items-center justify-center gap-2">
			<Button variant="link" href="/login" class="px-0">Back to login</Button>
		</div>
	</Card.Content>
</Card.Root>
