import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityRow } from "@/mocks/dashboard";

function timeLabel(iso: string): string {
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

export function ActivityList({
	rows,
	loading,
}: {
	rows?: ActivityRow[];
	loading?: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Aktivitas Terbaru</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{loading
					? Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
							<Skeleton key={i} className="h-10 w-full" />
						))
					: rows?.map((row) => (
							<div
								key={row.id}
								className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0"
							>
								<div className="min-w-0">
									<p className="truncate font-medium">{row.name}</p>
									<p className="truncate text-sm text-muted-foreground">
										{row.action}
									</p>
								</div>
								<span className="shrink-0 text-xs text-muted-foreground">
									{timeLabel(row.timestamp)}
								</span>
							</div>
						))}
			</CardContent>
		</Card>
	);
}
