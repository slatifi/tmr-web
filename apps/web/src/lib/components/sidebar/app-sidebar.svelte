<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { SidebarItem } from './types';
	import SidebarNav from './sidebar-nav.svelte';

	import favicon from '$lib/assets/favicon.png';
	import GaugeIcon from '@lucide/svelte/icons/gauge';
	import HammerIcon from '@lucide/svelte/icons/hammer';
	import MergeIcon from '@lucide/svelte/icons/merge';
	import SidebarUser from './sidebar-user.svelte';
	import { EyeIcon, UsersIcon } from '@lucide/svelte';
	import type { User } from '$lib/auth';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		user,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { user: User } = $props();

	const sidebarItems: SidebarItem[] = [
		{
			title: 'Dashboard',
			icon: GaugeIcon,
			url: '/dashboard'
		},
		{
			title: 'Guideline Viewer',
			icon: EyeIcon,
			url: '/viewer',
			matcher: /^\/viewer(\/.*)?$/
		},
		{
			title: 'Guideline Builder',
			icon: HammerIcon,
			url: '/builder',
			matcher: /^\/builder(\/.*)?$/
		},
		{
			title: 'Interaction Detection',
			icon: MergeIcon,
			url: '/interactions'
		}
	];

	const adminItems: SidebarItem[] = [
		{
			title: 'Manage Users',
			icon: UsersIcon,
			url: '/admin/users',
			matcher: /^\/admin\/users(\/.*)?$/
		}
	];
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/dashboard" {...props}>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-border text-sidebar-primary-foreground"
							>
								<img src={favicon} alt="TMR-W Logo" class="h-6 w-6" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="text-base font-medium">TMR-W</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<SidebarNav items={sidebarItems} adminItems={user.role === 'admin' ? adminItems : []} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<SidebarUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
