"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { YearlyPoint } from "@/mocks/dashboard";

/**
 * Heavy widget #1 — pulls in Recharts. The `before` variant imports this
 * statically (so Recharts lands in the first bundle); the `after` variant
 * loads it via `dynamic()`.
 */

const config = {
	value: { label: "UMKM Terdaftar", color: "var(--brand)" },
} satisfies ChartConfig;

export function YearlyChart({ data }: { data: YearlyPoint[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Pertumbuhan UMKM per Tahun</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={config} className="h-64 w-full">
					<AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="year"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Area
							dataKey="value"
							type="natural"
							fill="var(--color-value)"
							fillOpacity={0.2}
							stroke="var(--color-value)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
