"use client";

import { EmptyState, ErrorState } from "@/components/cashease/states";
import { TransactionRow } from "@/components/cashease/transaction-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/lib/query/use-user";

/**
 * "Latest Transfer" list on the transfer type screen — recent outgoing
 * transfers to contacts, reusing TransactionRow. Filtered to peer transfers
 * (kind "transfer"); top-ups and withdrawals belong on Home, not here.
 */
export function LatestTransfer() {
	const txQuery = useTransactions();

	if (txQuery.isPending) {
		return <RowsSkeleton />;
	}
	if (txQuery.isError) {
		return (
			<ErrorState message={txQuery.error.message} onRetry={txQuery.refetch} />
		);
	}

	const transfers = txQuery.data.filter((t) => t.kind === "transfer");
	if (transfers.length === 0) {
		return <EmptyState message="No transfers yet." />;
	}

	return (
		<div className="divide-y divide-border">
			{transfers.map((t) => (
				<TransactionRow key={t.id} transaction={t} />
			))}
		</div>
	);
}

function RowsSkeleton() {
	return (
		<div className="flex flex-col gap-4 py-3">
			{[0, 1, 2].map((i) => (
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
