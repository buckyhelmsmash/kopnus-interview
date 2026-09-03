"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ActivityList } from "@/components/dashboard/activity-list";
import { ChartSkeleton, MapSkeleton } from "@/components/dashboard/skeletons";
import { StatCards } from "@/components/dashboard/stat-cards";
import { Card, CardContent } from "@/components/ui/card";
import {
	useDashboardActivity,
	useDashboardProvinces,
	useDashboardStats,
	useDashboardYearly,
} from "@/lib/query/use-dashboard";

/**
 * THE FAST DASHBOARD — the fixed version, for Soal 4 evidence.
 *
 * Same four widgets, same mock API, same markup as `/dashboard/before`. The
 * only differences are technique, and each maps to one of the four fixes from
 * the performance answer.
 */

// FIX #2: the two heavy widgets load on demand via dynamic(), with skeletons.
// maplibre-gl touches `window`, so it must be `ssr: false`; neither belongs in
// the first-load bundle. This is what shrinks the route's First Load JS.
const YearlyChart = dynamic(
	() =>
		import("@/components/dashboard/yearly-chart").then((m) => m.YearlyChart),
	{ loading: () => <ChartSkeleton />, ssr: false },
);
const ProvinceMap = dynamic(
	() =>
		import("@/components/dashboard/province-map").then((m) => m.ProvinceMap),
	{ loading: () => <MapSkeleton />, ssr: false },
);

// FIX #1: widgets read from shared TanStack Query hooks. Two widgets asking for
// the same resource collapse into one in-flight request (dedup), and the cache
// means a repeat view is instant instead of a fresh fetch.
function StatsWidget() {
	const { data, isLoading } = useDashboardStats();
	return <StatCards stats={data} loading={isLoading} />;
}

function StatsHeader() {
	// Reads the SAME query as StatsWidget. No duplicate request — TanStack serves
	// both from one cache entry. (The `before` variant fired this twice.)
	const { data } = useDashboardStats();
	const total = data
		? data.umkm + data.students + data.mentors + data.programs
		: 0;
	return (
		<Card>
			<CardContent>
				<p className="text-sm text-muted-foreground">Total entitas terdaftar</p>
				<p className="text-2xl font-bold">{total.toLocaleString("id-ID")}</p>
			</CardContent>
		</Card>
	);
}

// FIX #3 + #4: the year filter state lives HERE, inside the only widget that
// needs it, so changing the year re-renders just this subtree, not the map or
// the stat cards. FIX #4: the query key is built from the plain `year` string
// (dashboardKeys.yearly(year)), so it stays reference-equal across renders and
// never triggers a refetch loop.
const YEARS = ["2022", "2023", "2024"];

function ChartWidget() {
	const [year, setYear] = useState("2024");
	const { data } = useDashboardYearly(year);
	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				{YEARS.map((y) => (
					<button
						key={y}
						type="button"
						onClick={() => setYear(y)}
						className={`rounded-md px-3 py-1 text-sm ring-1 ring-border ${
							y === year ? "bg-brand text-white" : "text-muted-foreground"
						}`}
					>
						{y}
					</button>
				))}
			</div>
			<YearlyChart data={data ?? []} />
		</div>
	);
}

function MapWidget() {
	const { data } = useDashboardProvinces();
	return <ProvinceMap provinces={data ?? []} />;
}

function ActivityWidget() {
	const { data, isLoading } = useDashboardActivity();
	return <ActivityList rows={data} loading={isLoading} />;
}

export default function AfterDashboard() {
	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
			<header className="flex flex-col gap-1">
				<p className="text-xs font-medium uppercase tracking-wide text-green-600">
					Contoh Baik — sudah diperbaiki
				</p>
				<h1 className="text-2xl font-bold tracking-tight">Dashboard (After)</h1>
				<p className="text-sm text-muted-foreground">
					Shared TanStack Query hooks (dedup), dynamic import untuk chart dan
					peta, state filter diturunkan, dan cache key stabil.
				</p>
			</header>

			<StatsHeader />
			<StatsWidget />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ChartWidget />
				<MapWidget />
			</div>
			<ActivityWidget />
		</main>
	);
}
