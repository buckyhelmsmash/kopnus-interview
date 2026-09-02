/** Simulate network latency so loading states are visible in the UI. */
export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Format an integer rupiah amount as `Rp 24.321.900`. */
export function formatRupiah(amount: number): string {
	return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(amount))}`;
}
