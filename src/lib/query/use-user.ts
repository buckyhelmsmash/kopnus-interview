"use client";

import { useQuery } from "@tanstack/react-query";
import type { Transaction, User } from "@/lib/types";
import { ApiClient } from "./api-client";
import { transactionKeys, userKeys } from "./keys";

/** Current user's profile + balance. */
export function useUser() {
	return useQuery({
		queryKey: userKeys.profile(),
		queryFn: () => ApiClient.get<User>("/api/user"),
	});
}

/** Recent transactions for the Home screen. */
export function useTransactions() {
	return useQuery({
		queryKey: transactionKeys.lists(),
		queryFn: () => ApiClient.get<Transaction[]>("/api/transactions"),
	});
}
