import { ArrowDownLeft, ArrowUpRight, Building2, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import { UserAvatar } from "@/components/cashease/user-avatar";
import { formatRupiah } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<
	Transaction["kind"],
	ComponentType<{ className?: string }>
> = {
	transfer: ArrowUpRight,
	topup: ArrowDownLeft,
	withdraw: Wallet,
	bank: Building2,
};

function formatWhen(iso: string): string {
	const date = new Date(iso);
	const time = date.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

	if (sameDay(date, today)) return `Today · ${time}`;
	if (sameDay(date, yesterday)) return `Yesterday · ${time}`;
	return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${time}`;
}

/**
 * A single transaction row: leading visual · name/time · signed amount.
 *
 * Peer transfers (which carry an `avatar`) show the counterparty's photo, as in
 * the Figma; system transactions (top-up, withdraw) fall back to an icon chip.
 */
export function TransactionRow({ transaction }: { transaction: Transaction }) {
	const Icon = ICONS[transaction.kind];
	const outgoing = transaction.direction === "out";

	return (
		<div className="flex items-center gap-3 py-3">
			{transaction.avatar ? (
				<UserAvatar
					name={transaction.name}
					src={transaction.avatar}
					className="size-11 shrink-0"
				/>
			) : (
				<div className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
					<Icon className="size-5" />
				</div>
			)}
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate font-medium text-ink">
					{transaction.name}
				</span>
				<span className="text-sm text-muted-foreground">
					{formatWhen(transaction.timestamp)}
				</span>
			</div>
			<span
				className={cn(
					"font-bold tabular-nums",
					outgoing ? "text-danger" : "text-success",
				)}
			>
				{outgoing ? "-" : "+"}
				{formatRupiah(transaction.amount)}
			</span>
		</div>
	);
}
