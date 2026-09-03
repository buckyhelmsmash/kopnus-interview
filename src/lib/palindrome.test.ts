import { describe, expect, test } from "bun:test";
import { checkPalindrome, isPalindrome, normalize } from "./palindrome";

describe("normalize", () => {
	test("lowercases", () => {
		expect(normalize("Katak")).toBe("katak");
	});

	test("strips spaces", () => {
		expect(normalize("Kasur ini rusak")).toBe("kasurinirusak");
	});

	test("strips punctuation", () => {
		expect(normalize("A man, a plan, a canal: Panama")).toBe(
			"amanaplanacanalpanama",
		);
	});

	test("keeps digits", () => {
		expect(normalize("1 2 3")).toBe("123");
	});

	test("punctuation-only normalises to empty", () => {
		expect(normalize("!?. ,")).toBe("");
	});
});

describe("isPalindrome", () => {
	test("Katak is a palindrome", () => {
		expect(isPalindrome("Katak")).toBe(true);
	});

	test("contoh is not a palindrome", () => {
		expect(isPalindrome("contoh")).toBe(false);
	});

	test("ignores spaces (Kasur ini rusak)", () => {
		expect(isPalindrome("Kasur ini rusak")).toBe(true);
	});

	test("ignores punctuation and case (Panama)", () => {
		expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
	});

	test("single character is trivially a palindrome", () => {
		expect(isPalindrome("x")).toBe(true);
	});
});

describe("checkPalindrome", () => {
	test("empty input is not checked", () => {
		expect(checkPalindrome("")).toEqual({ checked: false });
	});

	test("whitespace-only input is not checked", () => {
		expect(checkPalindrome("   ")).toEqual({ checked: false });
	});

	test("punctuation-only input is not checked", () => {
		expect(checkPalindrome("!?.")).toEqual({ checked: false });
	});

	test("a real palindrome returns checked with the normalised form", () => {
		expect(checkPalindrome("Katak")).toEqual({
			checked: true,
			isPalindrome: true,
			normalized: "katak",
		});
	});

	test("a non-palindrome returns checked false with the normalised form", () => {
		expect(checkPalindrome("contoh")).toEqual({
			checked: true,
			isPalindrome: false,
			normalized: "contoh",
		});
	});
});
