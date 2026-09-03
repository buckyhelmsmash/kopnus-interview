import { ArrowRight, GaugeIcon, TurtleIcon, ZapIcon } from "lucide-react";
import Link from "next/link";

/**
 * Dashboard demo index (Soal 4 evidence). Links to the deliberately slow
 * `before` variant and the fixed `after` variant, so a reviewer can profile
 * both in Chrome DevTools / Lighthouse and verify the before/after numbers.
 */

const VARIANTS = [
	{
		href: "/dashboard/before",
		title: "Before — sengaja lambat",
		desc: "Fetch per-komponen via useEffect (request duplikat), import statis chart + peta, state filter di root, cache key tidak stabil.",
		icon: <TurtleIcon className="size-5 text-red-500" />,
	},
	{
		href: "/dashboard/after",
		title: "After — sudah diperbaiki",
		desc: "Shared TanStack Query hooks (dedup), dynamic import chart + peta, state filter diturunkan, cache key stabil.",
		icon: <ZapIcon className="size-5 text-green-600" />,
	},
];

export default function DashboardIndex() {
	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
			<header className="flex flex-col gap-2">
				<div className="flex items-center gap-2 text-brand">
					<GaugeIcon className="size-5" />
					<span className="text-sm font-medium">
						Soal 4 — Studi Kasus Performa
					</span>
				</div>
				<h1 className="text-3xl font-bold tracking-tight">
					Demo Before / After
				</h1>
				<p className="text-muted-foreground">
					Dua dashboard dengan widget dan mock API yang sama. Yang membedakan
					hanya teknik frontend-nya. Buka Network tab, Performance recording,
					dan jalankan Lighthouse pada keduanya untuk membandingkan angkanya.
				</p>
			</header>

			<ul className="flex flex-col gap-3">
				{VARIANTS.map((v) => (
					<li key={v.href}>
						<Link
							href={v.href}
							className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
						>
							<span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
								{v.icon}
							</span>
							<div className="flex flex-1 flex-col">
								<span className="font-medium">{v.title}</span>
								<span className="text-sm text-muted-foreground">{v.desc}</span>
							</div>
							<ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
						</Link>
					</li>
				))}
			</ul>

			<Link
				href="/"
				className="text-sm text-muted-foreground underline-offset-4 hover:underline"
			>
				← Kembali ke beranda
			</Link>
		</main>
	);
}
