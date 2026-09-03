# Kopnus Interview — Frontend Take-Home

Four tasks (soal) in one repository, built with **Next.js (App Router) + TypeScript + Tailwind CSS**. The root page (`/`) is an index linking to each soal.

| Soal | Task | Route |
| --- | --- | --- |
| 1 | Recursive factorial calculator | [`/factorial`](http://localhost:3000/factorial) |
| 2 | Palindrome checker | [`/palindrome`](http://localhost:3000/palindrome) |
| 3 | CashEase e-wallet (transfer flow + mock API) | [`/cashease`](http://localhost:3000/cashease) |
| 4 | Performance case study (written) | [below](#soal-4--performance-case-study-studi-kasus-performa) |

## Tech stack

- **Next.js 16** (App Router only) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** components
- **TanStack Query** — data fetching/caching for the CashEase app
- **Bun** — package manager, script runner, and test runner (`bun:test`)
- **Biome** — lint + format (not ESLint/Prettier)

## Running the project

Requires [Bun](https://bun.sh) (this repo uses `bun@1.3.14`).

```bash
bun install        # install dependencies
bun run dev        # start the dev server → http://localhost:3000
```

Other scripts:

```bash
bun run build      # production build (also typechecks)
bun run start      # serve the production build
bun test           # run the unit tests (factorial + palindrome)
bun run check      # Biome lint + format (writes fixes)
```

## Folder structure

```
src/
├── app/                      # App Router routes
│   ├── page.tsx              # soal index (landing)
│   ├── layout.tsx            # root layout + QueryProvider
│   ├── globals.css           # Tailwind v4 theme + CashEase design tokens
│   ├── factorial/            # Soal 1 page
│   ├── palindrome/           # Soal 2 page
│   ├── cashease/             # Soal 3 app (nested transfer flow)
│   │   ├── page.tsx          #   Home
│   │   └── transfer/         #   type selector → friends → [contactId] → success
│   └── api/                  # Soal 3 mock REST API (Route Handlers)
│       ├── user/  transactions/  contacts/  contacts/[id]/  transfer/
├── components/
│   ├── ui/                   # shadcn base components (Button, Input, Card, …)
│   └── cashease/             # composed CashEase components + screens
├── lib/
│   ├── factorial.ts(.test)   # Soal 1 pure function + tests
│   ├── palindrome.ts(.test)  # Soal 2 pure function + tests
│   ├── types.ts              # CashEase domain types
│   ├── format.ts             # rupiah formatting + delay helper
│   └── query/                # TanStack Query stack (ApiClient, keys, hooks)
└── mocks/
    └── data.ts               # seed data for the mock API
```

## The tasks

### Soal 1 — Recursive factorial calculator (`/factorial`)

- Genuinely recursive core `factorial(n)` in `src/lib/factorial.ts`, self-calling with `0! = 1` as the base case.
- A validating wrapper `computeFactorial(n)` returns a discriminated result (`{ ok: true, value } | { ok: false, error }`) instead of throwing, so the UI renders errors cleanly. No `any` in the public API.
- Edge cases handled: `0! = 1`, negative → error, empty → compute button disabled, non-integer → error, and overflow beyond `170!` → a friendly note.
- Covered by `bun test` (`src/lib/factorial.test.ts`).

### Soal 2 — Palindrome checker (`/palindrome`)

- `normalize` + `isPalindrome` + `checkPalindrome` in `src/lib/palindrome.ts`.
- Case-insensitive, ignores spaces and punctuation (Unicode-aware via `\p{L}`/`\p{N}`).
- Checks **live as you type** (derived during render). The result uses **colour + text + icon** together (not colour alone) and shows the normalised form being compared.
- Covered by `bun test` (`src/lib/palindrome.test.ts`).

### Soal 3 — CashEase e-wallet (`/cashease`)

A responsive wallet app based on the [CashEase Figma](https://www.figma.com/design/yssi3szWnG6f64W9ONygXV/E-Wallet-Mobile-Apps---CashEase--Community-), implementing the full **transfer-to-friends** flow:

`Home → Transfer → Friends list → Set Amount → Success`

- **Mock REST API** via Next.js Route Handlers under `src/app/api/` (no external `json-server` — keeps it one repo, one deploy). Each endpoint simulates a delay so loading states are visible; the transfer endpoint re-validates server-side.
- **Data fetching** through a layered **TanStack Query** stack: an `ApiClient` transport, per-resource query-key factories, read hooks, and a transfer mutation that invalidates the balance and transaction caches on success.
- **Loading / error / empty** states handled explicitly on every fetch.
- **Set Amount form**: "Proceed to Transfer" disabled by default, enabled only on a valid amount; amounts below Rp10.000 are blocked with a clear error; submitting shows a loading state and prevents double-submit; API failures show an inline error and keep the form on screen.
- **Reusable UI** (`Button`, `Input`, `Card`, `Avatar`, …) composed into CashEase-specific components.

### Soal 4 — Performance case study

See [the written answer below](#soal-4--performance-case-study-studi-kasus-performa).

## Assumptions

- **Mock API** is implemented as Next.js Route Handlers (not `json-server`) to keep a single repository and a single deploy target.
- **CashEase transfer** implements the full **friends** flow; the **bank** flow is out of scope (the card is shown but leads to a "coming soon" state).
- **Set Amount** disabled + error states are an extension — the Figma shows only the default state; the brief's "disabled by default / error below Rp10.000" rules are added in the same visual language.
- **Amount > balance** is also blocked (sensible for a wallet, though not explicitly required).
- **Auth/login is out of scope** — a single seeded user is assumed logged in.
- **Money** is stored as integer rupiah (no decimals/cents).
- **Font**: Product Sans (Figma) is substituted with Geist for licensing reasons.
- **Factorial**: non-integer input is rejected; results beyond `170!` overflow JS `number` to `Infinity`, so a note is shown rather than adding a bignum dependency.
- **Palindrome**: empty / whitespace-only / punctuation-only input reads as "not checked", never a false positive.

---

## Soal 4 — Performance Case Study (Studi Kasus Performa)

> **Skenario:** Aplikasi digunakan oleh 100.000 users. Setelah release terbaru, halaman dashboard sangat lambat. API merespons dalam 200 ms, tetapi halaman butuh 5–8 detik untuk tampil.

<!-- TODO(interview): This section MUST be filled with a REAL project story and
     REAL before/after numbers from Bucky's experience. Hypothetical/generic
     answers are disqualified per the brief. The scaffolding below is the
     structure only — replace every _____ placeholder. -->

### 1. Apa yang dicek terlebih dahulu

_(Karena API hanya 200 ms, bottleneck ada di sisi frontend/render — bukan backend. Jelaskan bagaimana kamu mengonfirmasi ini terlebih dahulu.)_

_____

### 2. Membedakan masalah frontend vs backend

_(Network tab: TTFB vs. waktu paint; Server-Timing header; bandingkan latency API dengan total load time.)_

_____

### 3. Tools yang digunakan

_(Sebutkan yang spesifik: Chrome DevTools Performance, React DevTools Profiler, Lighthouse, `@next/bundle-analyzer`, output `next build`, dsb. — dan apa yang masing-masing ungkap.)_

_____

### 4. Yang dicek di Chrome DevTools

_(Network waterfall, Performance flame chart, long tasks, main-thread blocking, LCP/TBT.)_

_____

### 5. Cara mengecek JavaScript bundle di proyek Next.js

_(`@next/bundle-analyzer`, output per-route dari `next build`, ukuran JS per route, barrel-import bloat.)_

_____

### 6. Menemukan & memperbaiki unnecessary re-render

_(React DevTools Profiler — highlight updates, ranked chart, "why did this render"; perbaikan: memoization, state colocation, context splitting, deferring reads.)_

_____

### 7. Membuktikan fix benar-benar meningkatkan performa

**Contoh nyata — proyek: _____**

| Metric | Tool | Before | After |
| --- | --- | --- | --- |
| _____ | _____ | _____ | _____ |
| _____ | _____ | _____ | _____ |

- **Konteks proyek:** _____
- **Gejala + cara ditemukan:** _____
- **Root cause:** _____
- **Fix yang diterapkan:** _____
- **Tool untuk mengukur before/after:** _____

---

## Penggunaan AI (AI Usage Disclosure)

Sesuai kebijakan, berikut bagian yang dibantu AI beserta prompt/skill yang digunakan. Seluruh hasil dipahami penuh dan siap dijelaskan pada sesi demo & defense.

<!-- TODO(interview): Verify every row and paste the ACTUAL prompts you used in
     the "Prompt / instruction" column. The rows below record which skill/tool
     informed each area; replace the prompt text with your real wording. -->

| Area / files | AI tool & skill | Prompt / instruction used |
| --- | --- | --- |
| Project scaffolding, design tokens | Zed agent | _____ |
| Soal 3 — Figma design-system extraction (`docs/design-system.md`) | Figma MCP | _____ |
| Soal 3 — CashEase screens & components | Zed agent | _____ |
| Soal 3 — TanStack Query refactor (`src/lib/query/`) | `tanstack-query-fetching` skill | _____ |
| Soal 1 — factorial (function + tests + page) | `implement` + `tdd` skills | _____ |
| Soal 2 — palindrome (function + tests + page) | `implement` + `tdd` skills | _____ |
| Code review before commits | `code-review` skill | _____ |
| This README | `writing-for-agents` skill | _____ |

> **Catatan:** semua kode telah ditinjau, di-typecheck (`bun run build`), diuji (`bun test`), dan diverifikasi di browser sebelum di-commit.
