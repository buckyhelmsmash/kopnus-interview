"use client";

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
 *
 * SIN #1: every widget fetches on its own with a raw useEffect + useState. There
 * is no shared helper and no shared cache — the anti-pattern is copy-pasted into
 * each component by hand, exactly the way it grows in a real codebase. Two
 * widgets that need the same endpoint each fire their own request, and React
 * StrictMode double-invokes every effect in dev, so the same endpoint is hit
 * over and over — visible as duplicates in the Network tab.
 */

function StatsWidget() {
	// SIN #1: raw fetch in useEffect, no shared cache.
	const [data, setData] = useState<DashboardStats>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/dashboard/stats")
			.then((r) => r.json())
			.then((json: DashboardStats) => {
				setData(json);
				setLoading(false);
			});
	}, []);

	return <StatCards stats={data} loading={loading} />;
}

/**
 * SIN #1 (continued): this header ALSO fetches /api/dashboard/stats, completely
 * independently of StatsWidget, with its own copy-pasted useEffect. No shared
 * cache means the same endpoint is requested twice over — a duplicate the
 * Network tab shows plainly.
 */
function StatsHeader() {
	const [data, setData] = useState<DashboardStats>();

	useEffect(() => {
		fetch("/api/dashboard/stats")
			.then((r) => r.json())
			.then((json: DashboardStats) => setData(json));
	}, []);

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
	// SIN #1 + #3: this widget re-fetches from scratch on every render. The effect
	// depends on `year`, which lives at the root (SIN #3), so every filter click
	// re-renders the whole tree and re-fires this fetch — no cache, no dedup. The
	// `t=${Date.now()}` cache-buster makes sure each refetch is a real network hit
	// you can see in the Network tab (compare with `after`, where the same year
	// change is served from the TanStack cache).
	const [data, setData] = useState<YearlyPoint[]>([]);

	useEffect(() => {
		fetch(`/api/dashboard/yearly?upto=${year}&t=${Date.now()}`)
			.then((r) => r.json())
			.then((json: YearlyPoint[]) => setData(json));
	}, [year]);

	return (
		<div>
			<p className="mb-2 text-xs text-muted-foreground">Tahun aktif: {year}</p>
			<YearlyChart data={data} />
		</div>
	);
}

function MapWidget() {
	// SIN #1: raw fetch in useEffect, no shared cache.
	const [data, setData] = useState<Province[]>([]);

	useEffect(() => {
		fetch("/api/dashboard/provinces")
			.then((r) => r.json())
			.then((json: Province[]) => setData(json));
	}, []);

	return <ProvinceMap provinces={data} />;
}

function ActivityWidget() {
	// SIN #1: raw fetch in useEffect, no shared cache.
	const [data, setData] = useState<ActivityRow[]>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/dashboard/activity")
			.then((r) => r.json())
			.then((json: ActivityRow[]) => {
				setData(json);
				setLoading(false);
			});
	}, []);

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
					dan effect yang re-fire tiap render. Buka Network tab dan React
					Profiler untuk melihat requestnya. Filter aktif: {year}
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
