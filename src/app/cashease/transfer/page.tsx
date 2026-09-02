import { Building2, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { PhoneFrame, PurpleScreen } from "@/components/cashease/purple-screen";
import { ScreenHeader } from "@/components/cashease/screen-header";

export default function TransferTypePage() {
	return (
		<PhoneFrame>
			<PurpleScreen
				header={<ScreenHeader title="Transfer" backHref="/cashease" />}
			>
				<div className="grid grid-cols-2 gap-4">
					<Link
						href="/cashease/transfer/friends"
						className="flex flex-col gap-3 rounded-xl bg-brand-tint p-5 transition-transform active:scale-[0.98]"
					>
						<span className="grid size-11 place-items-center rounded-full bg-white text-brand">
							<Users className="size-6" />
						</span>
						<span className="text-lg font-medium text-ink">
							Transfer to Friends
						</span>
					</Link>

					{/* Bank flow is out of scope (documented in README). */}
					<div
						aria-disabled
						className="flex cursor-not-allowed flex-col gap-3 rounded-xl bg-brand-tint p-5 opacity-60"
					>
						<span className="grid size-11 place-items-center rounded-full bg-white text-brand">
							<Building2 className="size-6" />
						</span>
						<span className="text-lg font-medium text-ink">
							Transfer to Bank
						</span>
						<span className="text-xs text-muted-foreground">Coming soon</span>
					</div>
				</div>

				<section className="flex flex-col gap-2">
					<h2 className="font-heading text-xl font-bold text-ink">
						Latest Transfer
					</h2>
					<Link
						href="/cashease/transfer/friends"
						className="flex items-center justify-between rounded-2xl py-3 text-muted-foreground"
					>
						<span>Choose a contact to transfer</span>
						<ChevronRight className="size-5" />
					</Link>
				</section>
			</PurpleScreen>
		</PhoneFrame>
	);
}
