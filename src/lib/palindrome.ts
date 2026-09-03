/**
 * Palindrome checker (Soal 2).
 *
 * `normalize` folds a string down to comparable characters (lowercase,
 * alphanumeric only); `isPalindrome` compares that form to its reverse; and
 * `checkPalindrome` is the entry point the live UI uses — it distinguishes
 * "not checked" (empty / punctuation-only input) from a real true/false result
 * so the page never claims an empty box is a palindrome.
 */

export type PalindromeResult =
	| { checked: false }
	| { checked: true; isPalindrome: boolean; normalized: string };

/**
 * Lowercase and strip everything that isn't a letter or number. Unicode-aware
 * via `\p{L}`/`\p{N}`, so accented and non-Latin scripts fold correctly.
 */
export function normalize(input: string): string {
	return input.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/** True when the normalised string reads the same forwards and backwards. */
export function isPalindrome(input: string): boolean {
	const normalized = normalize(input);
	return normalized === reverse(normalized);
}

/**
 * Validate then check. Returns `{ checked: false }` when there's nothing to
 * compare (empty or punctuation-only), otherwise the result plus the
 * normalised form for the UI to show.
 */
export function checkPalindrome(input: string): PalindromeResult {
	const normalized = normalize(input);
	if (normalized === "") return { checked: false };
	return {
		checked: true,
		isPalindrome: normalized === reverse(normalized),
		normalized,
	};
}

function reverse(value: string): string {
	// Spread by code point so surrogate-pair characters reverse intact.
	return [...value].reverse().join("");
}
