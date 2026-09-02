"use client";

import { Check, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DetailRow } from "@/components/cashease/detail-row";
import { PhoneFrame } from "@/components/cashease/purple-screen";
import { UserAvatar } from "@/components/cashease/user-avatar";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import type { TransferReceipt } from "@/lib/types";

export function SuccessScreen() {
	const router = useRouter();
	const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

	useEffect(() => {
		const raw = sessionStorage.getItem("cashease:receipt");
		if (!raw) {
			router.replace("/cashease");
			return;
		}
		try {
			setReceipt(JSON.parse(raw) as TransferReceipt);
		} catch {
			router.replace("/cashease");
		}
	}, [router]);

	if (!receipt) {
		return (
			<PhoneFrame>
				<div className="grid flex-1 place-items-center bg-brand text-white">
					Loading…
				</div>
			</PhoneFrame>
		);
	}

	const date = new Date(receipt.date);
	const total = receipt.amount + receipt.fee;

	return (
		<PhoneFrame>
			<div className="relative flex flex-1 flex-col bg-brand px-5 pt-16 pb-8">
				<div className="relative mt-8 flex flex-col items-center rounded-3xl bg-background px-5 pt-14 pb-6">
					{/* floating check */}
					<span className="-top-9 absolute grid size-[72px] place-items-center rounded-full bg-success text-white shadow-lg">
						<Check className="size-9" strokeWidth={3} />
					</span>

					<h1 className="font-heading text-lg font-bold text-success">
						Transfer Successful
					</h1>
					<p className="text-center text-muted-foreground">
						Your money has been sent successfully
					</p>

					<p className="my-4 font-heading text-[40px] font-bold text-ink tabular-nums">
						{formatRupiah(receipt.amount)}
					</p>

					{/* send to */}
					<div className="flex w-full items-center gap-3 border-t border-border pt-4">
						<UserAvatar
							name={receipt.contact.name}
							src={receipt.contact.avatar}
							className="size-12"
						/>
						<div className="flex flex-col">
							<span className="font-medium text-ink">
								{receipt.contact.name}
							</span>
							<span className="text-sm text-muted-foreground">
								{receipt.contact.phone}
							</span>
						</div>
					</div>

					{/* details */}
					<div className="mt-4 w-full border-t border-border pt-2">
						<DetailRow label="Payment" value="Transfer to Friends" />
						<DetailRow
							label="Date"
							value={date.toLocaleDateString("en-GB", {
								day: "2-digit",
								month: "short",
								year: "numeric",
							})}
						/>
						<DetailRow
							label="Time"
							value={date.toLocaleTimeString("en-GB", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						/>
						<DetailRow label="Reference Number" value={receipt.reference} />
						<DetailRow label="Fee" value={formatRupiah(receipt.fee)} />
						<div className="mt-1 border-t border-border">
							<DetailRow
								label="Total Payment"
								value={formatRupiah(total)}
								emphasized
							/>
						</div>
					</div>
				</div>

				<div className="mt-auto flex flex-col gap-3 pt-6">
					<Button
						variant="outline"
						type="button"
						className="h-auto w-full rounded-full border-white bg-transparent py-4 text-lg font-bold text-white hover:bg-white/10 hover:text-white"
					>
						<Share2 />
						Share
					</Button>
					<Button
						asChild
						variant="secondary"
						className="h-auto w-full rounded-full bg-white py-4 text-lg font-bold text-brand hover:bg-white/90"
					>
						<Link href="/cashease">Back to Home</Link>
					</Button>
				</div>
			</div>
		</PhoneFrame>
	);
}
