"use client";

import { useQuery } from "@tanstack/react-query";
import type {
	ActivityRow,
	DashboardStats,
	Province,
	YearlyPoint,
} from "@/mocks/dashboard";
import { ApiClient } from "./api-client";
import { dashboardKeys } from "./keys";

/**
 * Read hooks for the dashboard demo (the `/dashboard/after` variant).
 *
 * Each hook keys through `dashboardKeys` and calls `ApiClient`. Because they
 * share one cache, two widgets asking for the same resource collapse into one
 * in-flight request (TanStack's dedup) — the fix for the duplicate-request sin
 * the `/dashboard/before` variant deliberately shows.
 */

export function useDashboardStats() {
	return useQuery({
		queryKey: dashboardKeys.stats(),
		queryFn: () => ApiClient.get<DashboardStats>("/api/dashboard/stats"),
	});
}

export function useDashboardYearly(year?: string) {
	return useQuery({
		queryKey: dashboardKeys.yearly(year),
		queryFn: () =>
			ApiClient.get<YearlyPoint[]>(
				`/api/dashboard/yearly${year ? `?upto=${year}` : ""}`,
			),
	});
}

export function useDashboardProvinces() {
	return useQuery({
		queryKey: dashboardKeys.provinces(),
		queryFn: () => ApiClient.get<Province[]>("/api/dashboard/provinces"),
	});
}

export function useDashboardActivity() {
	return useQuery({
		queryKey: dashboardKeys.activity(),
		queryFn: () => ApiClient.get<ActivityRow[]>("/api/dashboard/activity"),
	});
}
