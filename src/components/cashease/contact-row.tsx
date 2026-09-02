import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Contact } from "@/lib/types";
import { UserAvatar } from "./user-avatar";

/** A contact row in the friends list: avatar · name/phone · chevron. */
export function ContactRow({
	contact,
	href,
}: {
	contact: Contact;
	href: string;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-3 rounded-2xl py-3 transition-colors hover:bg-muted"
		>
			<UserAvatar
				name={contact.name}
				src={contact.avatar}
				className="size-[50px]"
			/>
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-lg font-medium text-ink">
					{contact.name}
				</span>
				<span className="text-muted-foreground">{contact.phone}</span>
			</div>
			<ChevronRight className="size-5 text-muted-foreground" />
		</Link>
	);
}
