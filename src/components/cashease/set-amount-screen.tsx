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
import {
	type Contact,
	MIN_TRANSFER,
	type TransferReceipt,
	type TransferResponse,
	type User,
} from "@/lib/types";
import { useFetch } from "@/lib/use-fetch";

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
	const contactState = useFetch<Contact>(`/api/contacts/${contactId}`);
	const userState = useFetch<User>("/api/user");

	const [amount, setAmount] = useState<number | null>(null);
	const [note, setNote] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const balance =
		userState.status === "success" ? userState.data.balance : undefined;
	const validation = useMemo(
		() => validate(amount, balance),
		[amount, balance],
	);

	const canSubmit = validation.kind === "valid" && !submitting;
	// Show the inline error only once the user has typed something invalid.
	const showError = validation.kind === "invalid";

	async function handleSubmit() {
		if (!canSubmit || amount === null) return;
		setSubmitting(true);
		setSubmitError(null);

		try {
			const res = await fetch("/api/transfer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contactId,
					amount,
					note: note.trim() || undefined,
				}),
			});
			const data = (await res.json()) as TransferResponse;

			if (!res.ok || !data.ok) {
				setSubmitError(data.ok ? "Transfer failed" : data.error);
				return;
			}

			// Hand the receipt to the success screen via sessionStorage
			// (avoids putting transfer data in the URL, no re-fetch).
			sessionStorage.setItem(
				"cashease:receipt",
				JSON.stringify(data satisfies TransferReceipt),
			);
			router.push("/cashease/transfer/success");
		} catch {
			setSubmitError("Network error. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<PhoneFrame>
			<PurpleScreen
				header={
					<ScreenHeader
						title="Set Amount"
						backHref="/cashease/transfer/friends"
						action={
							userState.status === "success" ? (
								<div className="flex flex-col items-end text-white">
									<span className="text-xs text-white/70">Your Balance</span>
									<span className="text-sm font-bold tabular-nums">
										{formatRupiah(userState.data.balance)}
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
				{contactState.status === "loading" ? (
					<div className="flex items-center gap-3">
						<Skeleton className="size-[60px] rounded-full" />
						<div className="flex flex-col gap-1.5">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				) : contactState.status === "error" ? (
					<ErrorState
						message={contactState.error}
						onRetry={contactState.refetch}
					/>
				) : (
					<div className="flex items-center gap-3">
						<UserAvatar
							name={contactState.data.name}
							src={contactState.data.avatar}
							className="size-[60px]"
						/>
						<div className="flex flex-col">
							<span className="text-lg font-medium text-ink">
								{contactState.data.name}
							</span>
							<span className="text-muted-foreground">
								{contactState.data.phone}
							</span>
						</div>
					</div>
				)}

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

				{submitError ? (
					<p
						className="flex items-center gap-1.5 text-sm text-danger"
						role="alert"
					>
						<AlertCircle className="size-4" />
						{submitError}
					</p>
				) : null}

				<Button
					type="button"
					onClick={handleSubmit}
					disabled={!canSubmit}
					className="mt-auto h-auto w-full rounded-full py-4 text-lg font-bold"
				>
					{submitting ? "Processing…" : "Proceed to Transfer"}
				</Button>
			</PurpleScreen>
		</PhoneFrame>
	);
}
