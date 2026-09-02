"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatRupiah } from "@/lib/format";

/**
 * "Your Balance" block rendered on the purple header, with a hide/show toggle.
 */
export function BalanceCard({ balance }: { balance: number }) {
	const [hidden, setHidden] = useState(false);

	return (
		<div className="flex flex-col gap-1 px-5 text-white">
			<span className="text-base font-medium text-white/80">Your Balance</span>
			<div className="flex items-center gap-3">
				<span className="font-heading text-[32px] font-bold tabular-nums">
					{hidden ? "Rp •••••••" : formatRupiah(balance)}
				</span>
				<button
					type="button"
					onClick={() => setHidden((h) => !h)}
					aria-label={hidden ? "Show balance" : "Hide balance"}
					aria-pressed={hidden}
					className="grid size-8 place-items-center rounded-full transition-colors hover:bg-white/10"
				>
					{hidden ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
				</button>
			</div>
		</div>
	);
}
