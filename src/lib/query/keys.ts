/**
 * Query-key factories — the single source of truth for each resource's cache
 * address. Keys are arrays ordered general → specific, each level spreading the
 * one above, so there's no key drift and prefix invalidation works.
 */

export const userKeys = {
	all: ["user"] as const,
	profile: () => [...userKeys.all, "profile"] as const,
};

export const transactionKeys = {
	all: ["transactions"] as const,
	lists: () => [...transactionKeys.all, "list"] as const,
};

export const contactKeys = {
	all: ["contacts"] as const,
	lists: () => [...contactKeys.all, "list"] as const,
	details: () => [...contactKeys.all, "detail"] as const,
	detail: (id: string) => [...contactKeys.details(), id] as const,
};

/**
 * Dashboard demo keys (Soal 4). `yearly` bakes the year filter into the key
 * from a *plain string*, not a fresh object — that's the stable-key fix from
 * the written answer (an object rebuilt each render would look unequal every
 * time and trigger a refetch loop).
 */
export const dashboardKeys = {
	all: ["dashboard"] as const,
	stats: () => [...dashboardKeys.all, "stats"] as const,
	yearly: (year?: string) =>
		[...dashboardKeys.all, "yearly", year ?? "all"] as const,
	provinces: () => [...dashboardKeys.all, "provinces"] as const,
	activity: () => [...dashboardKeys.all, "activity"] as const,
};
