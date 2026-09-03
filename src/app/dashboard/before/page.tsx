"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
// SIN #2: heavy widgets imported statically, so Recharts + maplibre-gl land in
// this route's first-load JS bundle whether or not the user scrolls to them.
import { ActivityList } from "@/components/dashboard/activity-list";
import { ProvinceMap } from "@/components/dashboard/province-map";
import { StatCards } from "@/components/dashboard/stat-cards";
import { YearlyChart } from "@/components/dashboard/yearly-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
	ActivityRow,
	DashboardStats,
	Province,
	YearlyPoint,
} from "@/mocks/dashboard";

/**
 * THE SLOW DASHBOARD — intentionally bad, for Soal 4 evidence.
 *
 * This file deliberately violates the project's own fetching conventions to
 * reproduce the four problems from the performance answer. It is NOT an example
 * of how the rest of this repo is written; the fixed version lives in
 * `/dashboard/after`. Each sin is marked inline.
 */

/**
 * SIN #1: a per-component fetch hook using useEffect + useState, with no shared
 * cache. This is the exact pattern the production app used before the TanStack
 * Query migration. Every component that calls it fires its own request, and
 * React StrictMode double-invokes the effect in dev, so the same endpoint is
 * hit again and again — visible as duplicates in the Network tab.
 */
function useEffectFetch<T>(url: string): { data?: T; loading: boolean } {
	const [data, setData] = useState<T>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let alive = true;
		setLoading(true);
		fetch(url)
			.then((r) => r.json())
			.then((json) => {
				if (alive) {
					setData(json as T);
					setLoading(false);
				}
			});
		return () => {
			alive = false;
		};
	}, [url]);

	return { data, loading };
}

function StatsWidget() {
	const { data, loading } = useEffectFetch<DashboardStats>(
		"/api/dashboard/stats",
	);
	return <StatCards stats={data} loading={loading} />;
}

/**
 * SIN #1 (continued): this header ALSO fetches /api/dashboard/stats, completely
 * independently of StatsWidget. No shared cache means the same endpoint is
 * requested twice over — a duplicate the Network tab shows plainly.
 */
function StatsHeader() {
	const { data } = useEffectFetch<DashboardStats>("/api/dashboard/stats");
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

function ChartWidget({ year }: { year: string }) {
	// SIN #4: the query key carries a value that changes on every render. Here a
	// fresh `Date` object is baked into the key. TanStack hashes keys, and a new
	// timestamp each render hashes differently every time, so TanStack thinks the
	// input changed and refetches — endlessly, on every re-render (and SIN #3
	// guarantees plenty of those). This is the class of bug that hid in the real
	// project: a non-stable value (a Date, a new object, an inline function) slips
	// into the key. Watch the yearly request refire without end in the Query
	// Devtools / Network tab.
	const { data } = useQuery({
		queryKey: ["before-yearly", year, new Date()],
		queryFn: () =>
			fetch(`/api/dashboard/yearly?upto=${year}`).then(
				(r) => r.json() as Promise<YearlyPoint[]>,
			),
	});
	return (
		<div>
			<p className="mb-2 text-xs text-muted-foreground">Tahun aktif: {year}</p>
			<YearlyChart data={data ?? []} />
		</div>
	);
}

function MapWidget() {
	const { data } = useEffectFetch<Province[]>("/api/dashboard/provinces");
	return <ProvinceMap provinces={data ?? []} />;
}

function ActivityWidget() {
	const { data, loading } = useEffectFetch<ActivityRow[]>(
		"/api/dashboard/activity",
	);
	return <ActivityList rows={data} loading={loading} />;
}

const YEARS = ["2022", "2023", "2024"];

export default function BeforeDashboard() {
	// SIN #3: the year filter lives at the very top of the tree, so changing it
	// re-renders EVERY widget below — the map and chart included — even though
	// only the chart cares about the year.
	const [year, setYear] = useState("2024");

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
			<header className="flex flex-col gap-1">
				<p className="text-xs font-medium uppercase tracking-wide text-red-500">
					Contoh Buruk — sengaja lambat
				</p>
				<h1 className="text-2xl font-bold tracking-tight">
					Dashboard (Before)
				</h1>
				<p className="text-sm text-muted-foreground">
					Fetch per-komponen via useEffect, import statis, state filter di root,
					dan key tidak stabil. Buka Network tab dan React Profiler untuk
					melihat requestnya. Filter aktif: {year}
				</p>
			</header>

			<div className="flex gap-2">
				{YEARS.map((y) => (
					<Button
						key={y}
						variant={y === year ? "default" : "outline"}
						size="sm"
						onClick={() => setYear(y)}
					>
						{y}
					</Button>
				))}
			</div>

			<StatsHeader />
			<StatsWidget />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ChartWidget year={year} />
				<MapWidget />
			</div>
			<ActivityWidget />
		</main>
	);
}
