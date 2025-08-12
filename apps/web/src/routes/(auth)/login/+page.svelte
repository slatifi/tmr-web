<script lang="ts">
	import { goto } from '$app/navigation';
	import { signIn } from '$lib/auth';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { data } = $props();

	let email = $state<string>('');
	let password = $state<string>('');
	let remember = $state<boolean>(false);
	let error = $state<string | undefined>(undefined);
	let validation = $state<{ email?: string } | null>(null);

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
			validation = { email: 'Please enter a valid email address.' };
			return;
		}

		const response = await signIn.email({ email, password, rememberMe: remember });

		if (response.error) {
			error = response.error.message;
			validation = null;
			return;
		}

		if (data.redirect) {
			return goto(data.redirect);
		}

		return goto('/dashboard');
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Please login below to continue</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if error}
			<div class="mb-5 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
				{error}
			</div>
		{/if}
		{#if data?.registered}
			<div class="mb-5 rounded-md bg-sidebar-accent p-4 text-sm text-sidebar-accent-foreground">
				You have successfully registered. Please login with your credentials.
			</div>
		{/if}
		{#if data?.redirect}
			<div class="mb-5 rounded-md bg-sidebar-accent p-4 text-sm text-sidebar-accent-foreground">
				Please login to access the requested page.
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
					<a href="##" class="ml-auto inline-block text-sm underline"> Forgot your password? </a>
				</div>
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-2">
						<Checkbox name="remember" bind:checked={remember} />
						<Label for="remember">Remember me</Label>
					</div>
				</div>
				<Button type="submit" class="w-full">Login</Button>
			</div>
		</form>
		<div class="mt-6 flex items-center justify-center gap-2">
			<span class="text-sm text-muted-foreground">Don't have an account?</span>
			<Button variant="link" href="/register" class="px-0">Register</Button>
		</div>
	</Card.Content>
</Card.Root>
