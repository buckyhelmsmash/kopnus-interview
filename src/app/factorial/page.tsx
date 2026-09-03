"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { computeFactorial, type FactorialResult } from "@/lib/factorial";

export default function FactorialPage() {
	const [raw, setRaw] = useState("");
	// The result is only shown after the user computes, so it lives in state
	// rather than being recomputed on every keystroke.
	const [result, setResult] = useState<FactorialResult | null>(null);

	const trimmed = raw.trim();
	const isEmpty = trimmed === "";

	// Derived during render — parsing a string is cheap, no memo needed.
	const parsed = isEmpty ? Number.NaN : Number(trimmed);
	const canCompute = !isEmpty && !Number.isNaN(parsed);

	function handleCompute() {
		if (isEmpty) return;
		setResult(computeFactorial(parsed));
	}

	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-6 py-16">
			<Link
				href="/"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to index
			</Link>

			<Card>
				<CardHeader>
					<CardTitle>Factorial Calculator</CardTitle>
					<CardDescription>
						Enter a non-negative integer to compute its factorial (n!). Computed
						recursively.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<form
						className="flex flex-col gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							handleCompute();
						}}
					>
						<label
							htmlFor="factorial-input"
							className="text-sm font-medium text-foreground"
						>
							Number (n)
						</label>
						<div className="flex gap-2">
							<Input
								id="factorial-input"
								type="text"
								inputMode="numeric"
								value={raw}
								onChange={(e) => setRaw(e.target.value)}
								placeholder="e.g. 6"
								aria-label="Number to compute the factorial of"
								aria-invalid={result?.ok === false}
								className="h-10"
							/>
							<Button
								type="submit"
								disabled={!canCompute}
								size="lg"
								className="h-10 px-6"
							>
								Compute
							</Button>
						</div>
					</form>

					{result ? <ResultView raw={trimmed} result={result} /> : null}
				</CardContent>
			</Card>
		</main>
	);
}

function ResultView({ raw, result }: { raw: string; result: FactorialResult }) {
	if (!result.ok) {
		return (
			<p
				role="alert"
				className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
			>
				{result.error}
			</p>
		);
	}

	return (
		<div
			aria-live="polite"
			className="flex flex-col gap-1 rounded-lg border border-border bg-muted/50 px-4 py-3"
		>
			<span className="text-sm text-muted-foreground">{raw}! =</span>
			<span className="font-mono text-2xl font-bold break-all tabular-nums">
				{result.value.toLocaleString("en-US")}
			</span>
		</div>
	);
}
