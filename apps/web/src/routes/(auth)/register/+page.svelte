<script lang="ts">
	import { signUp } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let name = $state<string>('');
	let email = $state<string>('');
	let password = $state<string>('');
	let validation = $state<{ name?: string; email?: string; password?: string } | null>(null);
	let error = $state<string | undefined>(undefined);

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
			validation = { email: 'Please enter a valid email address.' };
			return;
		}

		// Validate name
		if (typeof name !== 'string' || name.trim() === '' || name.length < 3) {
			validation = { name: 'Name must be at least 3 characters long.' };
			return;
		}

		// Validate password
		if (typeof password !== 'string' || password.length < 8) {
			validation = { password: 'Password must be at least 8 characters long.' };
			return;
		}

		// Login with Better Auth
		const result = await signUp.email({ name, email, password });
		if (result.error) {
			error = result.error.message;
			validation = null;
			return;
		}

		goto('/login?registered=true');
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Register</Card.Title>
		<Card.Description>Please fill in your details below to sign up</Card.Description>
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
					<Label>Name</Label>
					<Input name="name" type="text" placeholder="John Doe" bind:value={name} required />
					{#if validation?.name}
						<span class="text-sm text-destructive">{validation.name}</span>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label>Email</Label>
					<Input
						name="email"
						type="email"
						placeholder="me@example.com"
						bind:value={email}
						required
					/>
					{#if validation?.email}
						<span class="text-sm text-destructive">{validation.email}</span>
					{/if}
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label>Password</Label>
					</div>
					<Input name="password" type="password" bind:value={password} required />
				</div>
				<Button type="submit" class="w-full">Register</Button>
			</div>
		</form>
		<div class="mt-6 flex items-center justify-center gap-2">
			<span class="text-sm text-muted-foreground">Already have an account?</span>
			<Button variant="link" href="/login" class="px-0">Login</Button>
		</div>
	</Card.Content>
</Card.Root>
