import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Phone-width column that centres the mobile app on desktop.
 * The Figma canvas is 430px; on wider screens we frame it.
 */
export function PhoneFrame({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className="flex min-h-dvh justify-center bg-muted">
			<div
				className={cn(
					"relative flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
}

/**
 * Shared purple screen: brand background + decorative ellipses, with a white
 * content sheet (40px top radius) that holds the scrollable body.
 */
export function PurpleScreen({
	header,
	children,
	className,
}: {
	header?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className="relative flex min-h-dvh flex-col bg-brand">
			{/* decorative ellipses */}
			<div
				aria-hidden
				className="pointer-events-none absolute -top-16 -left-20 size-64 rounded-full bg-brand-dark/60 blur-2xl"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute top-24 -right-16 size-48 rounded-full bg-brand-dark/50 blur-2xl"
			/>

			{header}

			<div
				className={cn(
					"relative z-10 mt-4 flex flex-1 flex-col gap-6 rounded-t-[40px] bg-background px-5 pt-6 pb-8",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
}
