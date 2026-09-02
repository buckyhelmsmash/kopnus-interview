"use client";

import { type ChangeEvent, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Large "Set Amount" entry. Displays a formatted `Rp` prefix and thousands
 * separators while keeping the underlying value an integer number of rupiah.
 *
 * The value is controlled by the parent as a number | null (null = empty).
 */
export function AmountInput({
	value,
	onValueChange,
	invalid = false,
}: {
	value: number | null;
	onValueChange: (value: number | null) => void;
	invalid?: boolean;
}) {
	const id = useId();

	const display =
		value === null ? "" : new Intl.NumberFormat("id-ID").format(value);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const digits = e.target.value.replace(/\D/g, "");
		if (digits === "") {
			onValueChange(null);
			return;
		}
		onValueChange(Number.parseInt(digits, 10));
	}

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-lg font-medium text-ink">
				Set Amount
			</label>
			<div
				className={cn(
					"flex items-baseline gap-2 border-b-2 pb-2 transition-colors",
					invalid ? "border-danger" : "border-brand",
				)}
			>
				<span className="font-heading text-2xl font-bold text-muted-foreground">
					Rp
				</span>
				<input
					id={id}
					inputMode="numeric"
					autoComplete="off"
					value={display}
					onChange={handleChange}
					placeholder="0"
					aria-invalid={invalid}
					className="w-full bg-transparent font-heading text-[32px] font-bold text-ink tabular-nums outline-none placeholder:text-muted-foreground"
				/>
			</div>
		</div>
	);
}
