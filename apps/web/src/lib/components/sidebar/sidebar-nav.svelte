<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { SidebarItem } from './types';

	let {
		items,
		adminItems
	}: {
		items: SidebarItem[];
		adminItems?: SidebarItem[];
	} = $props();
</script>

<Sidebar.Group class="mt-2">
	<Sidebar.Menu>
		{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					isActive={item.matcher
						? item.matcher.test(page.url.pathname)
						: page.url.pathname === item.url}
				>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
		{#if adminItems && adminItems.length > 0}
			<Sidebar.Group class="mt-4 p-0">
				<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
				{#each adminItems as item (item.title)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={item.matcher
								? item.matcher.test(page.url.pathname)
								: page.url.pathname === item.url}
						>
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Group>
		{/if}
	</Sidebar.Menu>
</Sidebar.Group>
