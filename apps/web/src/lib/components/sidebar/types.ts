import type { Icon } from '@lucide/svelte';

interface SidebarItem {
	title: string;
	url: string;
	icon: typeof Icon;
	matcher?: RegExp;
}

export type { SidebarItem };
