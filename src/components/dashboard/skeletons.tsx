import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Fallback shown while the chart chunk loads (the `after` variant's dynamic import). */
export function ChartSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-56" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-64 w-full" />
			</CardContent>
		</Card>
	);
}

/** Fallback shown while the maplibre chunk loads (the `after` variant's dynamic import). */
export function MapSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-56" />
			</CardHeader>
			<CardContent className="p-0">
				<Skeleton className="h-80 w-full rounded-none" />
			</CardContent>
		</Card>
	);
}
