<script lang="ts">
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/auth';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	async function handleSignOut() {
		signOut();
		goto('/login');
	}
</script>

<p>Welcome {data?.user?.name}</p>

<Button onclick={handleSignOut}>Sign Out</Button>
