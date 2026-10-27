export function cleanParams(params: Iterable<[string, string]>) {
	return new URLSearchParams([...params].filter(([, value]) => value.trim() !== ''));
}
