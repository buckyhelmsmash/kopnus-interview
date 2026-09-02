"use client";

import { useCallback, useEffect, useState } from "react";

export type FetchState<T> =
	| { status: "loading"; data: null; error: null }
	| { status: "success"; data: T; error: null }
	| { status: "error"; data: null; error: string };

/**
 * Minimal typed data-fetching hook for the mock API.
 *
 * Kept dependency-free (no SWR) to keep the surface small; it exposes an
 * explicit loading/success/error state machine plus a `refetch` for retries.
 */
export function useFetch<T>(
	url: string,
): FetchState<T> & { refetch: () => void } {
	const [state, setState] = useState<FetchState<T>>({
		status: "loading",
		data: null,
		error: null,
	});

	const load = useCallback(
		(signal?: AbortSignal) => {
			setState({ status: "loading", data: null, error: null });
			fetch(url, { signal })
				.then(async (res) => {
					if (!res.ok) throw new Error(`Request failed (${res.status})`);
					return (await res.json()) as T;
				})
				.then((data) => setState({ status: "success", data, error: null }))
				.catch((err: unknown) => {
					if (signal?.aborted) return;
					const error =
						err instanceof Error ? err.message : "Something went wrong";
					setState({ status: "error", data: null, error });
				});
		},
		[url],
	);

	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal);
		return () => controller.abort();
	}, [load]);

	const refetch = useCallback(() => load(), [load]);

	return { ...state, refetch };
}
