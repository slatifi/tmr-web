import { PUBLIC_SNOMED_BASE_URL } from '$env/static/public';

let snomedToken: string = $state('');
const snomedNameCache: Map<string, string> = $state(new Map());

export async function getSnomedToken(): Promise<string> {
	if (!snomedToken) {
		const res = await fetch('/api/snomed/auth');
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

export async function getSnomedNames(codes: string[]): Promise<Map<string, string>> {
	const codesToFetch = codes.filter((code) => !(code in snomedNameCache));
	if (codesToFetch.length === 0) {
		return snomedNameCache;
	}

	for (const code of codesToFetch) {
		// Simple cache eviction policy: remove the oldest entry if we exceed 1000 entries
		if (snomedNameCache.size >= 1000) {
			const firstKey = snomedNameCache.keys().next().value;
			if (firstKey) snomedNameCache.delete(firstKey);
		}

		snomedNameCache[code] = await getNameFromSnomedCode(code);
	}
	return snomedNameCache;
}
