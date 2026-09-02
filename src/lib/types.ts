/**
 * CashEase domain types.
 *
 * Money is always an integer number of rupiah (no floats, no cents).
 */

export type Rupiah = number;

export interface User {
	id: string;
	name: string;
	avatar: string;
	points: number;
	balance: Rupiah;
}

export interface Contact {
	id: string;
	name: string;
	phone: string;
	avatar: string;
}

export type TransactionDirection = "in" | "out";

export interface Transaction {
	id: string;
	name: string;
	/** ISO timestamp of when the transaction occurred. */
	timestamp: string;
	amount: Rupiah;
	direction: TransactionDirection;
	/** Which visual chip/icon to render for the row. */
	kind: "transfer" | "topup" | "withdraw" | "bank";
}

export interface TransferRequest {
	contactId: string;
	amount: Rupiah;
	note?: string;
}

export interface TransferReceipt {
	ok: true;
	reference: string;
	/** ISO timestamp of when the transfer settled. */
	date: string;
	amount: Rupiah;
	fee: Rupiah;
	contact: Contact;
	note?: string;
}

export interface TransferError {
	ok: false;
	error: string;
}

export type TransferResponse = TransferReceipt | TransferError;

/** Minimum allowed transfer, per the brief. */
export const MIN_TRANSFER: Rupiah = 10_000;
