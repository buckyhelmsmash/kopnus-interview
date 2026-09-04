"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, type ReactNode, Suspense, useEffect, useState } from "react";

/**
 * App-wide TanStack Query provider.
 *
 * The client is held in `useState` so it's created once per app lifetime — a
 * bare `new QueryClient()` would rebuild (and wipe) the cache on every render.
 *
 * A non-zero `staleTime` serves fresh data from cache with no network call,
 * which is what makes repeat views instant (e.g. contacts fetched on Home are
 * reused by the friends screen instead of refetching).
 *
 * DevTools are exposed in production on purpose for the Soal 4 demo, two ways:
 *  - `window.__TANSTACK_QUERY_CLIENT__` lets the standalone browser-extension
 *    DevTools attach.
 *  - `window.toggleDevtools()` lazy-loads the in-page production DevTools panel
 *    (kept out of the initial bundle until toggled).
 */

declare global {
	interface Window {
		__TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
		toggleDevtools: () => void;
	}
}

const ReactQueryDevtoolsProduction = lazy(() =>
	import("@tanstack/react-query-devtools/build/modern/production.js").then(
		(d) => ({ default: d.ReactQueryDevtools }),
	),
);

export function QueryProvider({ children }: { children: ReactNode }) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						retry: 1,
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	const [showDevtools, setShowDevtools] = useState(false);

	useEffect(() => {
		window.__TANSTACK_QUERY_CLIENT__ = client;
		window.toggleDevtools = () => setShowDevtools((old) => !old);
	}, [client]);

	return (
		<QueryClientProvider client={client}>
			{children}
			{showDevtools && (
				<Suspense fallback={null}>
					<ReactQueryDevtoolsProduction />
				</Suspense>
			)}
		</QueryClientProvider>
	);
}
