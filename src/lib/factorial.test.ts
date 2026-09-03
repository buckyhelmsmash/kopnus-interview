import { describe, expect, test } from "bun:test";
import { computeFactorial, factorial } from "./factorial";

describe("factorial (recursive core)", () => {
	test("0! is 1", () => {
		expect(factorial(0)).toBe(1);
	});

	test("1! is 1", () => {
		expect(factorial(1)).toBe(1);
	});

	test("6! is 720", () => {
		expect(factorial(6)).toBe(720);
	});

	test("10! is 3628800", () => {
		expect(factorial(10)).toBe(3_628_800);
	});
});

describe("computeFactorial (validated)", () => {
	test("valid input returns ok with the value", () => {
		expect(computeFactorial(6)).toEqual({ ok: true, value: 720 });
	});

	test("0 returns ok with 1", () => {
		expect(computeFactorial(0)).toEqual({ ok: true, value: 1 });
	});

	test("negative input returns an error, not a crash", () => {
		const result = computeFactorial(-3);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/negative|non-negative/i);
	});

	test("non-integer input returns an error", () => {
		const result = computeFactorial(2.5);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/integer|whole/i);
	});

	test("NaN input returns an error", () => {
		const result = computeFactorial(Number.NaN);
		expect(result.ok).toBe(false);
	});

	test("very large input overflows to a friendly note, not Infinity to the UI", () => {
		const result = computeFactorial(171);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/too large|overflow/i);
	});

	test("170! is the largest representable factorial and stays ok", () => {
		const result = computeFactorial(170);
		expect(result.ok).toBe(true);
		if (result.ok) expect(Number.isFinite(result.value)).toBe(true);
	});
});
