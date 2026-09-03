"use client";

import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checkPalindrome } from "@/lib/palindrome";
import { cn } from "@/lib/utils";

const EXAMPLES = ["Katak", "Kasur ini rusak", "A man, a plan, a canal: Panama"];

export default function PalindromePage() {
	const [text, setText] = useState("");

	// Derived live during render — no submit button, no effect.
	const result = checkPalindrome(text);

	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-4 px-6 py-16">
			<Link
				href="/"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to index
			</Link>

			<Card>
				<CardHeader>
					<CardTitle>Palindrome Checker</CardTitle>
					<CardDescription>
						Type a word or sentence — it’s checked live, ignoring case, spaces,
						and punctuation.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label
							htmlFor="palindrome-input"
							className="text-sm font-medium text-foreground"
						>
							Text
						</label>
						<Input
							id="palindrome-input"
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="e.g. Kasur ini rusak"
							aria-label="Text to check for palindrome"
							aria-describedby="palindrome-result"
							className="h-10"
						/>
					</div>

					<div id="palindrome-result" aria-live="polite">
						{result.checked ? (
							<ResultBadge
								isPalindrome={result.isPalindrome}
								normalized={result.normalized}
							/>
						) : (
							<p className="text-sm text-muted-foreground">
								Enter some text to check.
							</p>
						)}
					</div>

					<div className="flex flex-col gap-2 border-t border-border pt-4">
						<span className="text-sm font-medium text-foreground">
							Try an example
						</span>
						<div className="flex flex-wrap gap-2">
							{EXAMPLES.map((example) => (
								<button
									key={example}
									type="button"
									onClick={() => setText(example)}
									className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								>
									{example}
								</button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

function ResultBadge({
	isPalindrome,
	normalized,
}: {
	isPalindrome: boolean;
	normalized: string;
}) {
	const Icon = isPalindrome ? CheckCircle2 : XCircle;

	return (
		<div className="flex flex-col gap-2">
			<div
				className={cn(
					"flex items-center gap-2 rounded-lg border px-3 py-2 font-medium",
					isPalindrome
						? "border-success/30 bg-success/10 text-success"
						: "border-destructive/30 bg-destructive/10 text-destructive",
				)}
			>
				<Icon className="size-5 shrink-0" />
				{isPalindrome ? "Palindrome" : "Not a palindrome"}
			</div>
			<p className="text-sm text-muted-foreground">
				Checking:{" "}
				<span className="font-mono break-all text-foreground">
					{normalized}
				</span>
			</p>
		</div>
	);
}
