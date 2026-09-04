# Kopnus Interview — Frontend Take-Home

Four tasks (soal) in one repository, built with **Next.js (App Router) + TypeScript + Tailwind CSS**. The root page (`/`) is an index linking to each soal.

| Soal | Task | Route |
| --- | --- | --- |
| 1 | Recursive factorial calculator | [`/factorial`](http://localhost:3000/factorial) |
| 2 | Palindrome checker | [`/palindrome`](http://localhost:3000/palindrome) |
| 3 | CashEase e-wallet (transfer flow + mock API) | [`/cashease`](http://localhost:3000/cashease) |
| 4 | Performance case study (written + live before/after demo) | [answer](SOAL-4.md) · [`/dashboard/before`](http://localhost:3000/dashboard/before) · [`/dashboard/after`](http://localhost:3000/dashboard/after) |

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
│   ├── dashboard/            # Soal 4 before/after demo
│   │   ├── before/           #   slow version (anti-pattern)
│   │   └── after/            #   fixed version (TanStack Query + dynamic)
│   └── api/                  # Soal 3 + Soal 4 mock REST API (Route Handlers)
│       ├── user/  transactions/  contacts/  contacts/[id]/  transfer/
│       └── dashboard/        #   Soal 4 mock endpoints (stats, yearly, provinces, activity)
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

Jawaban lengkap (7 sub-pertanyaan jadi satu alur) ada di [`SOAL-4.md`](SOAL-4.md), lengkap dengan angka before/after hasil pengukuran nyata.

Sebagai pelengkap, jawabannya dilengkapi **demo live** berupa dua halaman dashboard dengan widget dan mock API yang sama — yang beda cuma tekniknya:

- [`/dashboard/before`](http://localhost:3000/dashboard/before) — sengaja jelek: tiap widget fetch sendiri via `useEffect`, import statis, state filter di root, request duplikat.
- [`/dashboard/after`](http://localhost:3000/dashboard/after) — sudah diperbaiki: TanStack Query hooks (dedup), `dynamic({ ssr: false })`, state filter diturunkan, cache key stabil.

Cara membandingkan: buka Network tab (hitung request + duplikat), React Profiler (re-render saat ganti filter), dan Lighthouse (skor + LCP/TBT). Angka yang sudah diukur ada di tabel pada `SOAL-4.md`.

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

Jawaban lengkap dan angka before/after ada di [`SOAL-4.md`](SOAL-4.md). Demo live-nya di `/dashboard/before` dan `/dashboard/after` (lihat [Soal 4](#soal-4--performance-case-study) di atas).

---

## Penggunaan AI (AI Usage Disclosure)

Sesuai kebijakan, berikut cerita bagaimana AI membantu pengerjaan ini — dituturkan mengikuti urutan pengerjaan sebenarnya. Seluruh hasil dipahami penuh dan siap dijelaskan pada sesi demo & defense.

AI yang digunakan adalah **Zed coding agent**, dibantu sejumlah *skill* (instruksi terstruktur) dan *MCP server*. Alih-alih meminta AI menghasilkan kode mentah, saya menggunakannya sebagai pasangan kerja: saya yang mengambil keputusan desain, AI yang mengeksekusi dan mengusulkan.

### Tahap persiapan (sebelum menulis kode)

**1. Menyiapkan infrastruktur skill & spec.** Saya menjalankan skill **`setup-matt-pocock-skills`** untuk men-scaffold fondasi kerja berbasis skill: *issue tracker* lokal (`.scratch/`) dan tata letak dokumen domain (`CONTEXT.md`, `docs/adr/`). Ini yang membuat setiap soal bisa dikerjakan dari sebuah *spec* yang jelas.
> Prompt yang saya berikan: "I am taking a technical interview test. Global rules: 1. Use Next.js + TypeScript + Tailwind CSS. 2. Single Git repository. 3. Meaningful commits. 4. Detailed README.md (app description, run instructions, folder structure, AI prompt documentation). Set the issue tracker to 'Local markdown' using .scratch/ files."

**2. Memilih skill & tool pendukung.** Saya memakai skill **`ask-matt`** (sebuah *router* atas skill-skill di repo ini) untuk meminta rekomendasi skill dan tool yang cocok untuk proyek frontend ini. Hasilnya: saya memasang beberapa skill dan satu MCP server.
> Prompt yang saya berikan: "Recommend the skills that handle Next.js specifically. If there are vercel-labs recommendations, install those three skills directly."

| Skill / Tool | Peran dalam proyek |
| --- | --- |
| `vercel-react-best-practices` | Panduan optimasi performa React/Next.js (waterfall, bundle, re-render) |
| `vercel-composition-patterns` | Pola komposisi komponen agar reusable & mudah dirawat |
| `web-design-guidelines` | Audit UI terhadap standar aksesibilitas & UX |
| `shadcn` | Manajemen komponen shadcn/ui (add, compose, styling) |
| `implement` | Mengeksekusi tiap soal dari spec, mengendarai `tdd` & `code-review` |
| `writing-for-agents` | Panduan menyusun dokumen (README, skill) agar terstruktur & jelas |
| Figma MCP server | Ekstraksi desain CashEase langsung dari file Figma |

**3. Menyusun spec untuk keempat soal.** Dengan **`ask-matt`** sebagai orkestrator, saya menghasilkan *spec* untuk masing-masing soal sebelum implementasi. Setiap spec disusun dengan bantuan skill yang relevan:
> Prompt yang saya berikan: "Recommend skills for writing a spec per soal, then write a lightweight spec for all four soal (factorial, palindrome, CashEase, performance case study) into `.scratch/` — each spec lists acceptance criteria and which skills will be used to build it."

| Soal | Spec | Skill yang dipakai untuk menyusun spec |
| --- | --- | --- |
| Soal 1 — Faktorial | `.scratch/factorial/spec.md` | `ask-matt`, `vercel-react-best-practices` |
| Soal 2 — Palindrom | `.scratch/palindrome/spec.md` | `ask-matt`, `vercel-react-best-practices` |
| Soal 3 — CashEase | `.scratch/cashease/spec.md` | `ask-matt`, `shadcn`, `vercel-composition-patterns`, `web-design-guidelines`, Figma MCP |
| Soal 4 — Studi kasus performa | `.scratch/perf-case-study/spec.md` | `ask-matt`, `vercel-react-best-practices` |

### Tahap pengerjaan

**4. Fondasi proyek.** Saya mulai dengan menyiapkan proyek Next.js App Router, TypeScript, dan Tailwind, lalu menyusun design token CashEase ke `globals.css`.
> Prompt yang saya berikan: "Start with Soal 3, not in order. Extract the design system from Figma first. Use shadcn/ui as the UI library."

**5. Ekstraksi desain (Soal 3).** Untuk membaca desain Figma CashEase secara akurat, saya menghubungkan **Figma MCP server** dan meminta AI mengekstrak warna, tipografi, spacing, serta struktur tiap frame ke `docs/design-system.md` — yang jadi acuan saat membangun UI.
> Prompt yang saya berikan: "Use the Figma MCP server to extract colors, typography, spacing, and each frame's structure from the CashEase Figma file into `docs/design-system.md` as the styling reference."

**6. Membangun CashEase (Soal 3).** Berbekal design system tadi, AI membangun screen dan komponen reusable (Button, Input, Card, dan komponen CashEase) beserta mock API-nya.
> Prompt yang saya berikan: "Build all screens and reusable components (Button, Input, Card) plus the mock API for this flow: from Home click main-menu 1 to the Transfer page, click Transfer to Friends to the contact list, click a contact to the amount input page, then submit to the success page. Follow the design system in `docs/design-system.md`."

**7. Refactor data fetching (Soal 3).** Saya ingin lapisan fetching yang rapi, jadi saya pakai skill **`tanstack-query-fetching`** untuk merefactor dari hook buatan sendiri ke stack TanStack Query berlapis (`src/lib/query/`): `ApiClient`, query-key factory, dan hook read/write dengan invalidation.
> Prompt yang saya berikan: "Refactor the fetching mechanism to TanStack Query using the layered stack: ApiClient, query-key factory, and read/write hooks with invalidation, replacing the manual hooks."

**8. Soal 1 & Soal 2.** Keduanya dikerjakan test-first memakai skill **`implement`** dan **`tdd`**: fungsi murni (`factorial`, `palindrome`) ditulis beserta test `bun:test` lebih dulu, baru halamannya.
> Prompt yang saya berikan: "Do Soal 1 (factorial) test-first: write the pure function and its bun:test tests, then the page. Then do Soal 2 (palindrome) the same way."

**9. Review sebelum commit.** Sebelum meng-commit pekerjaan besar, saya menjalankan skill **`code-review`** untuk meninjau diff dari dua sisi: kesesuaian standar dan kesesuaian spec.
