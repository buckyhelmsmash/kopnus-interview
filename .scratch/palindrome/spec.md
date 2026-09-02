# Spec: Palindrome Checker — Soal 2

## Goal

A page/component that checks whether a word or sentence is a palindrome, ignoring case, spaces, and punctuation, with a clear visual result.

## Route

- `/palindrome` (App Router: `src/app/palindrome/page.tsx`)

## Functional requirements

- Input: a word or sentence (string).
- Normalise before comparison:
  - Case-insensitive (lowercase everything).
  - Ignore spaces.
  - Ignore punctuation / non-alphanumeric characters.
- Compare the normalised string against its reverse.
- Show a clear visual indication of the result (e.g. green "Palindrome" badge vs. red "Not a palindrome").

## Examples

| Input | Normalised | Result |
| --- | --- | --- |
| `Katak` | `katak` | Palindrome |
| `contoh` | `contoh` | Not a palindrome |
| `Kasur ini rusak` | `kasurinirusak` | Palindrome |
| `A man, a plan, a canal: Panama` | `amanaplanacanalpanama` | Palindrome |

## Edge cases

| Input | Behaviour (assumption) |
| --- | --- |
| Empty string | Treat as "not checked" / prompt for input; do not claim palindrome. |
| Single character | Palindrome (trivially). |
| Only punctuation/spaces | Normalises to empty → treat as "not checked". |

## Type design

- Pure function in `src/lib/palindrome.ts`, e.g. `isPalindrome(input: string): boolean`.
- Normalisation is a small internal helper; consider exposing the normalised form for the UI to display ("checking: kasurinirusak").

## Acceptance criteria

- [ ] `isPalindrome("Katak") === true`
- [ ] `isPalindrome("contoh") === false`
- [ ] Punctuation and spaces are ignored (Panama example passes).
- [ ] Result updates live as the user types (derived state, no manual submit needed — assumption).
- [ ] Visual indicator is unmistakable (colour + text, not colour alone — a11y).

## Assumptions to record in README

- Unicode letters are supported via a case-fold + strip of non-alphanumerics (regex `\p{L}\p{N}` where practical); ASCII-only fallback is acceptable for the test.
- Empty/whitespace-only input is "not checked", not a false positive.

## Skills in play

- Optional `web-design-guidelines` for the result indicator (colour-alone is an a11y anti-pattern; pair with text/icon).
