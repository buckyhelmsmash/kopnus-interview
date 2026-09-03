"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	TransferReceipt,
	TransferRequest,
	TransferResponse,
} from "@/lib/types";
import { ApiClient } from "./api-client";
import { transactionKeys, userKeys } from "./keys";

/**
 * Submit a transfer. On success it invalidates the caches the write makes
 * stale — the user's balance and the transaction list — so returning Home
 * shows fresh values. A caller-supplied `onSuccess` runs after invalidation
 * (e.g. to stash the receipt and navigate) without the hook hard-coding UI.
 */
export function useTransfer(options?: {
	onSuccess?: (receipt: TransferReceipt) => void;
}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: TransferRequest): Promise<TransferReceipt> => {
			// ApiClient throws on !res.ok; a 200 with `{ ok: false }` is not
			// possible from our API, but we guard the type regardless.
			const data = await ApiClient.post<TransferRequest, TransferResponse>(
				"/api/transfer",
				body,
			);
			if (!data.ok) throw new Error(data.error);
			return data;
		},
		onSuccess: (receipt) => {
			queryClient.invalidateQueries({ queryKey: userKeys.profile() });
			queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
			options?.onSuccess?.(receipt);
		},
	});
}
