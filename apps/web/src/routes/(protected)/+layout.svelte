<script lang="ts">
	import { page } from '$app/state';
	import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<Sidebar.Provider>
	<AppSidebar user={{ name: data.user.name, email: data.user.email }} />
	<Sidebar.Inset>
		<header
			class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<span class="text-lg font-semibold">{page.data?.meta.title || 'TMR-W'}</span>
			</div>
		</header>
		<div class="flex flex-col p-4">
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
