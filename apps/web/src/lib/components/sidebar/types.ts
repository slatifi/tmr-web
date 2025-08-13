import type { Icon } from '@lucide/svelte';

interface SidebarItem {
	title: string;
	url: string;
	icon: typeof Icon;
}

export type { SidebarItem };
