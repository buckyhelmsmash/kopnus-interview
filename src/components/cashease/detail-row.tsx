import { cn } from "@/lib/utils";

/** A label/value row used in the success receipt's Transaction Details. */
export function DetailRow({
	label,
	value,
	emphasized = false,
}: {
	label: string;
	value: string;
	emphasized?: boolean;
}) {
	return (
		<div className="flex items-center justify-between py-2">
			<span
				className={cn(
					"text-sm",
					emphasized ? "font-bold text-brand" : "text-muted-foreground",
				)}
			>
				{label}
			</span>
			<span
				className={cn(
					"text-sm font-bold tabular-nums",
					emphasized ? "text-xl text-brand" : "text-ink",
				)}
			>
				{value}
			</span>
		</div>
	);
}
