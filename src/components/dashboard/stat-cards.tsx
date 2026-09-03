import {
	BookOpenIcon,
	GraduationCapIcon,
	StoreIcon,
	UserCheckIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/mocks/dashboard";

/**
 * Presentational widgets shared by both dashboard variants. The markup is
 * identical across `/dashboard/before` and `/dashboard/after`; only the
 * *technique* that feeds them data (raw useEffect vs shared query hooks)
 * differs. Keeping the visuals here means the measured difference is purely
 * the fetching/import/render technique, not the UI.
 */

function StatCard({
	count,
	label,
	icon,
	loading,
}: {
	count: number;
	label: string;
	icon: ReactNode;
	loading?: boolean;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4">
				<div className="shrink-0 rounded-full bg-brand/10 p-3 text-brand">
					{icon}
				</div>
				{loading ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-7 w-20" />
						<Skeleton className="h-4 w-24" />
					</div>
				) : (
					<div>
						<p className="text-2xl font-bold tracking-tight">
							{count.toLocaleString("id-ID")}
						</p>
						<p className="text-sm text-muted-foreground">{label}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function StatCards({
	stats,
	loading,
}: {
	stats?: DashboardStats;
	loading?: boolean;
}) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				count={stats?.umkm ?? 0}
				label="Total UMKM"
				loading={loading}
				icon={<StoreIcon className="size-6" />}
			/>
			<StatCard
				count={stats?.students ?? 0}
				label="Total Mahasiswa"
				loading={loading}
				icon={<GraduationCapIcon className="size-6" />}
			/>
			<StatCard
				count={stats?.mentors ?? 0}
				label="Total Mentor"
				loading={loading}
				icon={<UserCheckIcon className="size-6" />}
			/>
			<StatCard
				count={stats?.programs ?? 0}
				label="Program Aktif"
				loading={loading}
				icon={<BookOpenIcon className="size-6" />}
			/>
		</div>
	);
}
