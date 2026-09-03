"use client";

import {
	ArrowLeftRight,
	MoreHorizontal,
	Plus,
	Send,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { BalanceCard } from "@/components/cashease/balance-card";
import { NavBar } from "@/components/cashease/nav-bar";
import { PhoneFrame } from "@/components/cashease/purple-screen";
import { EmptyState, ErrorState } from "@/components/cashease/states";
import { TransactionRow } from "@/components/cashease/transaction-row";
import { UserAvatar } from "@/components/cashease/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/lib/query/use-contacts";
import { useTransactions, useUser } from "@/lib/query/use-user";

const MENU = [
	{ label: "Transfer", icon: Send, href: "/cashease/transfer" },
	{ label: "Top Up", icon: Plus, href: "/cashease" },
	{ label: "Withdraw", icon: Wallet, href: "/cashease" },
	{ label: "More", icon: MoreHorizontal, href: "/cashease" },
];

export function HomeScreen() {
	// Parallel fetches — user and transactions are independent, no waterfall.
	const userQuery = useUser();
	const txQuery = useTransactions();
	const contactsQuery = useContacts();

	return (
		<PhoneFrame>
			<div className="relative flex flex-1 flex-col bg-brand pt-6">
				{/* header */}
				<div className="flex items-center justify-between px-5 text-white">
					<div className="flex items-center gap-2">
						<ArrowLeftRight className="size-6" />
						<span className="font-heading text-xl font-bold">CashEase</span>
					</div>
					{userQuery.isSuccess ? (
						<span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
							{userQuery.data.points.toLocaleString("id-ID")} Points
						</span>
					) : (
						<Skeleton className="h-7 w-24 rounded-full bg-white/20" />
					)}
				</div>

				{/* balance */}
				<div className="py-6">
					{userQuery.isPending ? (
						<div className="flex flex-col gap-2 px-5">
							<Skeleton className="h-4 w-24 bg-white/20" />
							<Skeleton className="h-9 w-52 bg-white/20" />
						</div>
					) : userQuery.isError ? (
						<div className="px-5">
							<ErrorState
								message={userQuery.error.message}
								onRetry={userQuery.refetch}
							/>
						</div>
					) : (
						<BalanceCard balance={userQuery.data.balance} />
					)}
				</div>

				{/* white sheet */}
				<div className="relative z-10 flex flex-1 flex-col gap-6 rounded-t-[40px] bg-background px-5 pt-6 pb-8">
					{/* main menu */}
					<div className="grid grid-cols-4 gap-2 rounded-xl bg-card py-4 shadow-[0px_4px_25px_rgba(26,26,26,0.1)]">
						{MENU.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.label}
									href={item.href}
									className="flex flex-col items-center gap-2 text-sm font-medium text-ink"
								>
									<span className="grid size-12 place-items-center rounded-full bg-brand-tint text-brand">
										<Icon className="size-5" />
									</span>
									{item.label}
								</Link>
							);
						})}
					</div>

					{/* send again */}
					<section className="flex flex-col gap-3">
						<h2 className="font-heading text-xl font-bold text-ink">
							Send again
						</h2>
						<SendAgain query={contactsQuery} />
					</section>

					{/* latest transactions */}
					<section className="flex flex-col gap-1">
						<h2 className="font-heading text-xl font-bold text-ink">
							Latest Transaction
						</h2>
						{txQuery.isPending ? (
							<RowsSkeleton />
						) : txQuery.isError ? (
							<ErrorState
								message={txQuery.error.message}
								onRetry={txQuery.refetch}
							/>
						) : txQuery.data.length === 0 ? (
							<EmptyState message="No transactions yet." />
						) : (
							<div className="divide-y divide-border">
								{txQuery.data.map((t) => (
									<TransactionRow key={t.id} transaction={t} />
								))}
							</div>
						)}
					</section>
				</div>
			</div>

			<NavBar active="home" />
		</PhoneFrame>
	);
}

function SendAgain({ query }: { query: ReturnType<typeof useContacts> }) {
	if (query.isPending) {
		return (
			<div className="flex gap-4">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="flex flex-col items-center gap-1">
						<Skeleton className="size-14 rounded-full" />
						<Skeleton className="h-3 w-12" />
					</div>
				))}
			</div>
		);
	}
	if (query.isError) {
		return <ErrorState message={query.error.message} onRetry={query.refetch} />;
	}

	return (
		<div className="flex gap-4 overflow-x-auto pb-1">
			<Link
				href="/cashease/transfer/friends"
				className="flex shrink-0 flex-col items-center gap-1"
			>
				<span className="grid size-14 place-items-center rounded-full border-2 border-dashed border-brand text-brand">
					<Plus className="size-5" />
				</span>
				<span className="text-sm text-ink">Add New</span>
			</Link>
			{query.data.slice(0, 6).map((c) => (
				<Link
					key={c.id}
					href={`/cashease/transfer/friends/${c.id}`}
					className="flex shrink-0 flex-col items-center gap-1"
				>
					<UserAvatar name={c.name} src={c.avatar} className="size-14" />
					<span className="max-w-16 truncate text-sm text-ink">
						{c.name.split(" ")[0]}
					</span>
				</Link>
			))}
		</div>
	);
}

function RowsSkeleton() {
	return (
		<div className="flex flex-col gap-4 py-3">
			{[0, 1, 2, 3].map((i) => (
				<div key={i} className="flex items-center gap-3">
					<Skeleton className="size-11 rounded-full" />
					<div className="flex flex-1 flex-col gap-1.5">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-20" />
					</div>
					<Skeleton className="h-4 w-20" />
				</div>
			))}
		</div>
	);
}
