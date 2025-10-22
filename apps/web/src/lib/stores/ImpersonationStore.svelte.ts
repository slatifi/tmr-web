import { browser } from '$app/environment';
import { authClient } from '$lib/auth';

class ImpersonationStore {
	private impersonatedUserId = $state<string | null>(
		browser ? sessionStorage.getItem('impersonatedUserId') : null
	);

	isImpersonating() {
		return this.impersonatedUserId !== null;
	}

	setImpersonatedUser(userId: string) {
		this.impersonatedUserId = userId;
		if (browser) {
			sessionStorage.setItem('impersonatedUserId', userId);
		}
	}

	async stopImpersonation() {
		if (this.impersonatedUserId) {
			await authClient.admin.stopImpersonating();
		}

		this.impersonatedUserId = null;
		if (browser) {
			sessionStorage.removeItem('impersonatedUserId');
		}
	}
}

export const impersonationStore = new ImpersonationStore();
