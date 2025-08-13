<script lang="ts">
	import logo from '$lib/assets/logo.png';
	let { children } = $props();
</script>

<div class="flex min-h-screen min-w-screen flex-col items-center justify-center gap-4 bg-muted">
	<div class="">
		<img src={logo} alt="TMR-W Logo" class="h-15 md:h-20" />
	</div>
	<div class="flex w-full items-center justify-center px-4 sm:px-6">
		{@render children?.()}
	</div>
</div>
