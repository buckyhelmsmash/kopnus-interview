"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AmountInput } from "@/components/cashease/amount-input";
import { PhoneFrame, PurpleScreen } from "@/components/cashease/purple-screen";
import { ScreenHeader } from "@/components/cashease/screen-header";
import { ErrorState } from "@/components/cashease/states";
import { UserAvatar } from "@/components/cashease/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/format";
import { useContact } from "@/lib/query/use-contacts";
import { useTransfer } from "@/lib/query/use-transfer";
import { useUser } from "@/lib/query/use-user";
import { MIN_TRANSFER, type TransferReceipt } from "@/lib/types";

type Validation =
	| { kind: "empty" }
	| { kind: "invalid"; message: string }
	| { kind: "valid" };

/** Derive validation from the amount during render — no effects needed. */
function validate(
	amount: number | null,
	balance: number | undefined,
): Validation {
	if (amount === null || amount === 0) return { kind: "empty" };
	if (amount < MIN_TRANSFER) {
		return { kind: "invalid", message: "Minimum transfer is Rp10.000" };
	}
	if (balance !== undefined && amount > balance) {
		return { kind: "invalid", message: "Insufficient balance" };
	}
	return { kind: "valid" };
}

export function SetAmountScreen({ contactId }: { contactId: string }) {
	const router = useRouter();
	const contactQuery = useContact(contactId);
	const userQuery = useUser();

	const [amount, setAmount] = useState<number | null>(null);
	const [note, setNote] = useState("");

	const transfer = useTransfer({
		onSuccess: (receipt: TransferReceipt) => {
			// Hand the receipt to the success screen via sessionStorage
			// (avoids putting transfer data in the URL, no re-fetch).
			sessionStorage.setItem("cashease:receipt", JSON.stringify(receipt));
			router.push("/cashease/transfer/success");
		},
	});

	const balance = userQuery.isSuccess ? userQuery.data.balance : undefined;
	const validation = useMemo(
		() => validate(amount, balance),
		[amount, balance],
	);

	const canSubmit = validation.kind === "valid" && !transfer.isPending;
	// Show the inline error only once the user has typed something invalid.
	const showError = validation.kind === "invalid";

	function handleSubmit() {
		if (!canSubmit || amount === null) return;
		transfer.mutate({ contactId, amount, note: note.trim() || undefined });
	}

	return (
		<PhoneFrame>
			<PurpleScreen
				header={
					<ScreenHeader
						title="Set Amount"
						backHref="/cashease/transfer/friends"
						action={
							userQuery.isSuccess ? (
								<div className="flex flex-col items-end text-white">
									<span className="text-xs text-white/70">Your Balance</span>
									<span className="text-sm font-bold tabular-nums">
										{formatRupiah(userQuery.data.balance)}
									</span>
								</div>
							) : (
								<span />
							)
						}
					/>
				}
			>
				{/* recipient header */}
				{contactQuery.isPending ? (
					<div className="flex items-center gap-3">
						<Skeleton className="size-[60px] rounded-full" />
						<div className="flex flex-col gap-1.5">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				) : contactQuery.isError ? (
					<ErrorState
						message={contactQuery.error.message}
						onRetry={contactQuery.refetch}
					/>
				) : contactQuery.isSuccess ? (
					<div className="flex items-center gap-3">
						<UserAvatar
							name={contactQuery.data.name}
							src={contactQuery.data.avatar}
							className="size-[60px]"
						/>
						<div className="flex flex-col">
							<span className="text-lg font-medium text-ink">
								{contactQuery.data.name}
							</span>
							<span className="text-muted-foreground">
								{contactQuery.data.phone}
							</span>
						</div>
					</div>
				) : null}

				<AmountInput
					value={amount}
					onValueChange={setAmount}
					invalid={showError}
				/>

				{showError ? (
					<p
						className="flex items-center gap-1.5 text-sm text-danger"
						role="alert"
					>
						<AlertCircle className="size-4" />
						{validation.message}
					</p>
				) : null}

				{/* notes */}
				<div className="flex flex-col gap-2">
					<span className="text-lg font-medium text-ink">Notes (optional)</span>
					<Textarea
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Payment for Lunch"
						rows={3}
						className="resize-none bg-[#F7F7F7]"
					/>
				</div>

				{transfer.isError ? (
					<p
						className="flex items-center gap-1.5 text-sm text-danger"
						role="alert"
					>
						<AlertCircle className="size-4" />
						{transfer.error.message}
					</p>
				) : null}

				<Button
					type="button"
					onClick={handleSubmit}
					disabled={!canSubmit}
					className="mt-auto h-auto w-full rounded-full py-4 text-lg font-bold"
				>
					{transfer.isPending ? "Processing…" : "Proceed to Transfer"}
				</Button>
			</PurpleScreen>
		</PhoneFrame>
	);
}
