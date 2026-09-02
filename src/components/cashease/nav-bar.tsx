import { Clock, Home, QrCode, User } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type NavKey = "home" | "history" | "profile";

const ITEMS: {
	key: NavKey;
	label: string;
	icon: ComponentType<{ className?: string }>;
	href: string;
}[] = [
	{ key: "home", label: "Home", icon: Home, href: "/cashease" },
	{ key: "history", label: "History", icon: Clock, href: "/cashease" },
	{ key: "profile", label: "Profile", icon: User, href: "/cashease" },
];

/** Bottom navigation bar with a central scan FAB. */
export function NavBar({ active = "home" }: { active?: NavKey }) {
	return (
		<nav className="sticky bottom-0 z-20 border-t border-[#F1F1F1] bg-background">
			<div className="relative mx-auto flex max-w-[430px] items-center justify-around px-6 py-3">
				{ITEMS.slice(0, 2).map((item) => (
					<NavItem key={item.key} item={item} active={active === item.key} />
				))}

				<Link
					href="/cashease"
					aria-label="Scan"
					className="-mt-8 grid size-14 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0px_4px_20px_rgba(26,26,26,0.2)]"
				>
					<QrCode className="size-6" />
				</Link>

				{ITEMS.slice(2).map((item) => (
					<NavItem key={item.key} item={item} active={active === item.key} />
				))}
			</div>
		</nav>
	);
}

function NavItem({
	item,
	active,
}: {
	item: (typeof ITEMS)[number];
	active: boolean;
}) {
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			className={cn(
				"flex w-16 flex-col items-center gap-1 text-sm font-medium transition-colors",
				active ? "text-brand" : "text-muted-foreground",
			)}
			aria-current={active ? "page" : undefined}
		>
			<Icon className="size-5" />
			{item.label}
		</Link>
	);
}
