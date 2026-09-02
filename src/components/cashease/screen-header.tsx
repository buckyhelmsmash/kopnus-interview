import { ChevronLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Title row shared by every transfer screen: back arrow · title · help icon,
 * rendered on the purple header.
 */
export function ScreenHeader({
	title,
	backHref,
	action,
}: {
	title: string;
	backHref: string;
	action?: ReactNode;
}) {
	return (
		<header className="relative z-10 flex items-center justify-between px-5 pt-6 pb-2 text-white">
			<Link
				href={backHref}
				aria-label="Go back"
				className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/10"
			>
				<ChevronLeft className="size-6" />
			</Link>
			<h1 className="font-heading text-xl font-bold">{title}</h1>
			{action ?? (
				<button
					type="button"
					aria-label="Help"
					className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/10"
				>
					<HelpCircle className="size-6" />
				</button>
			)}
		</header>
	);
}
