/**
 * Recursive factorial (Soal 1).
 *
 * `factorial` is the genuinely recursive core — it self-calls and assumes a
 * valid non-negative integer. `computeFactorial` is the safe entry point the UI
 * uses: it validates the input and returns a discriminated result instead of
 * throwing, so the page can render errors cleanly.
 */

export type FactorialResult =
	| { ok: true; value: number }
	| { ok: false; error: string };

/**
 * The recursive core. Defined on non-negative integers only; callers must
 * validate first (see `computeFactorial`). 0! and 1! are the base case.
 */
export function factorial(n: number): number {
	if (n <= 1) return 1;
	return n * factorial(n - 1);
}

/**
 * `170!` is the largest factorial representable as a finite JS `number`;
 * `171!` overflows to `Infinity`. We surface a friendly note at that boundary
 * rather than pulling in a bignum dependency (out of scope for this test).
 */
const MAX_SAFE_INPUT = 170;

/** Validate then compute. Never throws; the UI branches on `result.ok`. */
export function computeFactorial(n: number): FactorialResult {
	if (Number.isNaN(n)) {
		return { ok: false, error: "Enter a number." };
	}
	if (!Number.isInteger(n)) {
		return { ok: false, error: "Enter a whole number (integers only)." };
	}
	if (n < 0) {
		return {
			ok: false,
			error: "Factorial is only defined for non-negative integers.",
		};
	}
	if (n > MAX_SAFE_INPUT) {
		return {
			ok: false,
			error: `Result is too large to represent (max input is ${MAX_SAFE_INPUT}).`,
		};
	}
	return { ok: true, value: factorial(n) };
}
