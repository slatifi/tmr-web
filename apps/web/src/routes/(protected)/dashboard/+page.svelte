<script lang="ts">
	let { data } = $props();
</script>

<p>Welcome {data?.user?.name}</p>
<p>Message from the server: {data?.message}</p>
