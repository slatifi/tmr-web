<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.png';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>{page.data?.meta?.title || 'Web'} | TMR-W</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
