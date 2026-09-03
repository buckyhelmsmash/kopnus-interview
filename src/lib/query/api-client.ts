/**
 * Thin transport over `fetch` — the one place that knows how to make an HTTP
 * request. Every method is generically typed so callers declare their own
 * response shape and stay type-checked against their own contract.
 *
 * Scope note (see docs/design-system.md / README): the reference recipe also
 * centralises **auth** (attach a bearer token) and **envelope unwrapping**
 * (`{ result: ... }`). CashEase's mock API has neither — auth is out of scope
 * (single seeded user) and responses are already unwrapped — so those layers
 * are intentionally omitted here rather than stubbed. The remaining job,
 * throw-on-failure, is load-bearing: `useQuery`/`useMutation` only populate
 * their `error` state from a thrown error.
 */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
	});

	if (!res.ok) {
		const message = await extractError(res);
		throw new Error(message);
	}

	return (await res.json()) as T;
}

async function extractError(res: Response): Promise<string> {
	try {
		const body = (await res.json()) as { error?: unknown };
		if (typeof body.error === "string") return body.error;
	} catch {
		// non-JSON body; fall through to a generic message
	}
	return `Request failed (${res.status})`;
}

export const ApiClient = {
	get: <T>(url: string) => request<T>(url),
	post: <TBody, TResponse>(url: string, body: TBody) =>
		request<TResponse>(url, { method: "POST", body: JSON.stringify(body) }),
	patch: <TBody, TResponse>(url: string, body: TBody) =>
		request<TResponse>(url, { method: "PATCH", body: JSON.stringify(body) }),
	delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
