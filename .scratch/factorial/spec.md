# Spec: Factorial Calculator (Recursive) — Soal 1

## Goal

A page/component that computes the factorial of a positive integer **recursively**, with correct TypeScript typing (no unnecessary `any`) and full edge-case handling.

## Route

- `/factorial` (App Router: `src/app/factorial/page.tsx`)

## Functional requirements

- Input: a single positive integer.
- Output: the factorial result. Example: `6 → 720`.
- The core function MUST be recursive.

## Edge cases (all required by the manuscript)

| Input | Expected behaviour |
| --- | --- |
| `0` | Result `1` (0! = 1) |
| Negative (e.g. `-3`) | Clear error message; no computation |
| Empty input | Clear error message (or disabled state); no computation |
| Non-integer (e.g. `2.5`) | Clear error message (assumption — see below) |
| Very large (e.g. `> 170`) | Result is `Infinity` in JS `number`; show a friendly note (assumption) |

## Type design

- Pure function lives in `src/lib/factorial.ts`, e.g. `factorial(n: number): number`.
- Validation returns a discriminated result rather than throwing, so the UI can render errors cleanly. Suggested shape: `type FactorialResult = { ok: true; value: number } | { ok: false; error: string }`.

## Acceptance criteria

- [ ] `factorial(0) === 1`
- [ ] `factorial(6) === 720`
- [ ] Negative input surfaces an error, not a crash/stack overflow.
- [ ] Empty input surfaces an error and the compute button is disabled.
- [ ] Function is genuinely recursive (self-call), verifiable by reading the code.
- [ ] No `any` in the public API.

## Assumptions to record in README

- Non-integer input is rejected with an error (factorial is defined on non-negative integers).
- Results beyond `170!` overflow JS `number` to `Infinity`; we surface a note rather than adding a bignum dependency (out of scope for the test).

## Skills in play

- None strictly required (pure TypeScript). Optional: `vercel-react-best-practices` for the input component if we add debounced/derived state, but likely overkill.
