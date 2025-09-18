import {
	PUBLIC_SNOMED_AUTH_URL,
	PUBLIC_SNOMED_BASE_URL,
	PUBLIC_SNOMED_CLIENT_ID,
	PUBLIC_SNOMED_CLIENT_SECRET
} from '$env/static/public';
import { SvelteURLSearchParams } from 'svelte/reactivity';

let snomedToken: string = $state('');

export async function getSnomedToken(): Promise<string> {
	// TODO: Move auth token to server to avoid exposing client secret
	if (!snomedToken) {
		const res = await fetch(PUBLIC_SNOMED_AUTH_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new SvelteURLSearchParams({
				grant_type: 'client_credentials',
				client_id: PUBLIC_SNOMED_CLIENT_ID,
				client_secret: PUBLIC_SNOMED_CLIENT_SECRET
			})
		});
		const data = await res.json();
		snomedToken = data.access_token;
		const expiresIn = data.expires_in; // in seconds

		// Set a timeout to clear the token before it expires
		setTimeout(
			() => {
				snomedToken = '';
			},
			(expiresIn - 60) * 1000
		);
		return snomedToken;
	} else {
		return snomedToken;
	}
}

export type SnomedExpansionResponse = {
	expansion: {
		contains: Array<{
			code: string;
			display: string;
			designation?: Array<{ use: { code: string }; value: string }>;
		}>;
	};
};

export type SnomedCodeDisplayLookupResponse = {
	parameter: Array<{
		name: string;
		valueString: string;
	}>;
};

export async function fetchSnomedData<T>(endpoint: string, backoff: boolean = false): Promise<T> {
	const token = await getSnomedToken();
	const res = await fetch(PUBLIC_SNOMED_BASE_URL + endpoint, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!res.ok && res.status === 401 && !backoff) {
		snomedToken = '';
		return fetchSnomedData(endpoint, true);
	} else if (!res.ok) {
		throw new Error(`Error fetching SNOMED data: ${res.statusText}`);
	}
	return await res.json();
}

export async function getNameFromSnomedCode(code: string): Promise<string> {
	try {
		const data = await fetchSnomedData<SnomedCodeDisplayLookupResponse>(
			`/CodeSystem/$lookup?system=http://snomed.info/sct&code=${code}&_format=json&property=display`
		);
		if (data.parameter && data.parameter.length > 0) {
			const displayParam = data.parameter.find((param) => param.name === 'display');
			return displayParam?.valueString || '??';
		} else {
			return '??';
		}
	} catch {
		return '??';
	}
}
