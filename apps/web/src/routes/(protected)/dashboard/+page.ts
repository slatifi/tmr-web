export const load = async ({ fetch }) => {
	const response = await fetch('/api').then((res) => res.text());
	return {
		message: response,
		meta: {
			title: 'Dashboard'
		}
	};
};
