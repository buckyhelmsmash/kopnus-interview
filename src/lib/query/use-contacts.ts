"use client";

import { useQuery } from "@tanstack/react-query";
import type { Contact } from "@/lib/types";
import { ApiClient } from "./api-client";
import { contactKeys } from "./keys";

/** All contacts for the friends list (filtered client-side by the screen). */
export function useContacts() {
	return useQuery({
		queryKey: contactKeys.lists(),
		queryFn: () => ApiClient.get<Contact[]>("/api/contacts"),
	});
}

/**
 * A single contact for the Set Amount recipient header.
 * Gated with `enabled` so it holds until an id exists.
 */
export function useContact(id: string | undefined) {
	return useQuery({
		queryKey: contactKeys.detail(id ?? ""),
		queryFn: () => ApiClient.get<Contact>(`/api/contacts/${id}`),
		enabled: !!id,
	});
}
