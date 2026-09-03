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
