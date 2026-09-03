"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

/**
 * App-wide TanStack Query provider.
 *
 * The client is held in `useState` so it's created once per app lifetime — a
 * bare `new QueryClient()` would rebuild (and wipe) the cache on every render.
 *
 * A non-zero `staleTime` serves fresh data from cache with no network call,
 * which is what makes repeat views instant (e.g. contacts fetched on Home are
 * reused by the friends screen instead of refetching).
 */
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

	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
