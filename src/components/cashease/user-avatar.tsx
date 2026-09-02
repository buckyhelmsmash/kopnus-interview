import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

/**
 * CashEase avatar with an image + initials fallback. Sizes are passed via
 * `className` (e.g. `size-12`) since the Figma uses several avatar sizes.
 */
export function UserAvatar({
	name,
	src,
	className,
}: {
	name: string;
	src?: string;
	className?: string;
}) {
	return (
		<Avatar className={cn("size-12", className)}>
			{src ? <AvatarImage src={src} alt={name} /> : null}
			<AvatarFallback className="bg-brand-tint font-medium text-brand">
				{initials(name)}
			</AvatarFallback>
		</Avatar>
	);
}
