import { ArrowRight } from "lucide-react";
import Link from "next/link";

const SOAL = [
	{
		n: 1,
		title: "Factorial Calculator",
		desc: "Recursive factorial with typed edge cases.",
		href: "/factorial",
		ready: true,
	},
	{
		n: 2,
		title: "Palindrome Checker",
		desc: "Case- and punctuation-insensitive palindrome check.",
		href: "/palindrome",
		ready: true,
	},
	{
		n: 3,
		title: "CashEase E-Wallet",
		desc: "Responsive wallet app with a full transfer flow and mock API.",
		href: "/cashease",
		ready: true,
	},
	{
		n: 4,
		title: "Performance Case Study",
		desc: "Written answer in the project README.",
		href: "https://github.com/buckyhelmsmash/kopnus-interview#soal-4--performance-case-study-studi-kasus-performa",
		ready: true,
	},
];

export default function Home() {
	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Kopnus Interview</h1>
				<p className="text-muted-foreground">
					Frontend take-home test — Next.js, TypeScript, and Tailwind CSS.
				</p>
			</header>

			<ul className="flex flex-col gap-3">
				{SOAL.map((s) => (
					<li key={s.n}>
						<Link
							href={s.href}
							aria-disabled={!s.ready}
							className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50"
						>
							<span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 font-bold text-brand">
								{s.n}
							</span>
							<div className="flex flex-1 flex-col">
								<span className="font-medium">
									Soal {s.n} — {s.title}
									{!s.ready ? (
										<span className="ml-2 text-xs text-muted-foreground">
											(coming soon)
										</span>
									) : null}
								</span>
								<span className="text-sm text-muted-foreground">{s.desc}</span>
							</div>
							<ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
