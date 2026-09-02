import { delay } from "@/lib/format";
import { MIN_TRANSFER, type TransferResponse } from "@/lib/types";
import { contacts, user } from "@/mocks/data";

export const dynamic = "force-dynamic";

const TRANSFER_FEE = 0;

function reference(): string {
	return `CE${Date.now().toString(36).toUpperCase()}${Math.floor(
		Math.random() * 1000,
	)
		.toString()
		.padStart(3, "0")}`;
}

export async function POST(request: Request): Promise<Response> {
	await delay(1500);

	let body: { contactId?: unknown; amount?: unknown; note?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: "Invalid request body" }, 400);
	}

	const contactId = typeof body.contactId === "string" ? body.contactId : "";
	const amount = typeof body.amount === "number" ? body.amount : Number.NaN;
	const note = typeof body.note === "string" ? body.note : undefined;

	const contact = contacts.find((c) => c.id === contactId);
	if (!contact) {
		return json({ ok: false, error: "Recipient not found" }, 404);
	}

	// Re-validate server-side; never trust the client alone.
	if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
		return json({ ok: false, error: "Enter a valid amount" }, 422);
	}
	if (amount < MIN_TRANSFER) {
		return json({ ok: false, error: "Minimum transfer is Rp10.000" }, 422);
	}
	if (amount + TRANSFER_FEE > user.balance) {
		return json({ ok: false, error: "Insufficient balance" }, 422);
	}

	return json(
		{
			ok: true,
			reference: reference(),
			date: new Date().toISOString(),
			amount,
			fee: TRANSFER_FEE,
			contact,
			note,
		},
		200,
	);
}

function json(payload: TransferResponse, status: number): Response {
	return Response.json(payload, { status });
}
