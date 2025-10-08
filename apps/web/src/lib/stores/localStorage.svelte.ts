import { SvelteMap } from 'svelte/reactivity';
import { browser } from '$app/environment';

export function createLocalStorageMap<K, V>(key: string) {
	const storedValue = browser ? localStorage.getItem(key) : null;
	const initial = new SvelteMap<K, V>(storedValue ? JSON.parse(storedValue) : []);
	const value = $state(initial);

	// Subscribe to changes and update localStorage
	$effect.root(() => {
		$effect(() => {
			console.log('Map changed, updating localStorage');
			if (!browser) return;
			localStorage.setItem(key, JSON.stringify(Array.from(value.entries())));
		});
	});

	return value;
}
