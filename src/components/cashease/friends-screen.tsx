"use client";

import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { ContactRow } from "@/components/cashease/contact-row";
import { PhoneFrame, PurpleScreen } from "@/components/cashease/purple-screen";
import { ScreenHeader } from "@/components/cashease/screen-header";
import { EmptyState, ErrorState } from "@/components/cashease/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/lib/query/use-contacts";

export function FriendsScreen() {
	const contactsQuery = useContacts();
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		if (!contactsQuery.isSuccess) return [];
		const q = query.trim().toLowerCase();
		if (!q) return contactsQuery.data;
		return contactsQuery.data.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
		);
	}, [contactsQuery.isSuccess, contactsQuery.data, query]);

	return (
		<PhoneFrame>
			<PurpleScreen
				header={
					<ScreenHeader
						title="Transfer to Friends"
						backHref="/cashease/transfer"
					/>
				}
			>
				{/* search + add */}
				<div className="flex items-center gap-3">
					<label className="flex flex-1 items-center gap-2 rounded-full border border-[#999999] px-4 py-3">
						<Search className="size-5 text-muted-foreground" />
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search Phone Number"
							aria-label="Search contacts"
							className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						/>
					</label>
					<button
						type="button"
						aria-label="Add contact"
						className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-tint text-brand"
					>
						<UserPlus className="size-5" />
					</button>
				</div>

				<section className="flex flex-col gap-1">
					<h2 className="font-heading text-xl font-bold text-ink">
						All Contact
					</h2>

					{contactsQuery.isPending ? (
						<ContactsSkeleton />
					) : contactsQuery.isError ? (
						<ErrorState
							message={contactsQuery.error.message}
							onRetry={contactsQuery.refetch}
						/>
					) : filtered.length === 0 ? (
						<EmptyState
							message={
								query ? `No contacts match "${query}".` : "No contacts yet."
							}
						/>
					) : (
						<div className="divide-y divide-border">
							{filtered.map((c) => (
								<ContactRow
									key={c.id}
									contact={c}
									href={`/cashease/transfer/friends/${c.id}`}
								/>
							))}
						</div>
					)}
				</section>
			</PurpleScreen>
		</PhoneFrame>
	);
}

function ContactsSkeleton() {
	return (
		<div className="flex flex-col gap-4 py-3">
			{[0, 1, 2, 3, 4].map((i) => (
				<div key={i} className="flex items-center gap-3">
					<Skeleton className="size-[50px] rounded-full" />
					<div className="flex flex-1 flex-col gap-1.5">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
			))}
		</div>
	);
}
