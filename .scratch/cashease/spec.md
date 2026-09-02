# Spec: E-Wallet App (CashEase) — Soal 3

## Goal

A responsive web app (mobile + desktop) based on the CashEase Figma, with at least two pages: **Home** and **Transfer**. Data comes from a self-made mock REST API with a simulated delay so loading states are visible.

Figma: https://www.figma.com/design/yssi3szWnG6f64W9ONygXV/E-Wallet-Mobile-Apps---CashEase--Community-

## Routes (App Router) — full friends flow

| Route | Screen | Figma node |
| --- | --- | --- |
| `/cashease` | Home (balance, menu, recent, transactions) | #67:738 |
| `/cashease/transfer` | Transfer type selector (Friends / Bank) | #70:2048 |
| `/cashease/transfer/friends` | Friends list (search + contacts) | #79:2301 |
| `/cashease/transfer/friends/[contactId]` | Set Amount form ⭐ | #82:363 |
| `/cashease/transfer/success` | Transfer receipt / success | #105:445 |

> Grouped under `/cashease` so the wallet app is self-contained and root `/` can host a simple index linking to all four soal.
> **Bank flow is excluded** — the "Transfer to Bank" card is shown but leads to a "coming soon"/disabled state, documented as out of scope.
> The `/transfer` type selector satisfies the manuscript's "minimal 2 pages"; the deeper screens are the value-add showing real routing + state passing.

## Mock API

Implemented as Next.js **Route Handlers** under `src/app/api/` (Next 16 App Router; see `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` at build time). No external `json-server` needed — keeps it single-repo and deployable.

| Endpoint | Method | Returns / accepts |
| --- | --- | --- |
| `/api/user` | GET | User profile (name, avatar, points) + balance. Simulate ~1–1.5s delay. |
| `/api/transactions` | GET | Recent transactions list (for Home). Simulated delay. |
| `/api/contacts` | GET | Friends/contact list (avatar, name, phone) for the friends screen. Simulated delay. |
| `/api/contacts/[id]` | GET | Single contact (for the Set Amount recipient header). |
| `/api/transfer` | POST | Accepts `{ contactId, amount, note? }`. Validates server-side (min 10000, ≤ balance), returns `{ ok, reference, date, fee }` or an error. Simulated delay. |

- Delay via `await new Promise(r => setTimeout(r, ms))` inside the handler.
- Data seeded from a local TS module in `src/mocks/`.
- Money stored as integer rupiah (no floats).
- Server re-validates the amount (never trust client-only validation).

## Home page (#67:738)

- Shows user info (name, avatar, points) and **balance**, fetched from the API.
- Main-menu shortcuts (Transfer → links into the flow; Top Up/Withdraw/More may be inert/coming-soon).
- "Send again" friend avatars + "Latest Transaction" list (or an empty state if none).
- Bottom navbar (Home active).
- Must handle **loading**, **error**, and **empty** states explicitly.
- Currency formatted as IDR (`Rp` + thousands separators).

## Transfer type selector (#70:2048)

- Two cards: "Transfer to Friends" (→ friends list) and "Transfer to Bank" (out of scope / disabled).
- "Latest Transfer" list below (reuses TransactionRow).

## Friends list (#79:2301)

- Search box (filter contacts by name/phone — client-side filter over fetched contacts).
- "All Contact" list: avatar + name + phone + chevron. Tapping a row → Set Amount for that contact.
- Loading/error/empty states for the contacts fetch.

## Set Amount form (#82:363) ⭐ — the required transfer form

Recipient header (from `/api/contacts/[id]`) + amount entry + optional note + "Proceed to Transfer".

Rules (all from the manuscript):

- "Proceed to Transfer" button is **disabled by default**, enabled **only** when the entered amount is valid.
- Transfer **not allowed if amount < Rp10.000** — show a clear error message.
- On confirm, POST to `/api/transfer`; on success navigate to the success screen; on failure show an error status.
- Handle loading (submitting) state on the button.

### Validation rules

| Condition | UI behaviour |
| --- | --- |
| Empty / non-numeric amount | Button disabled, no error yet (gentle hint) |
| Amount < 10000 | Button disabled + visible error "Minimum transfer is Rp10.000" |
| Amount > balance | Button disabled + error "Insufficient balance" (assumption) |
| Valid amount | Button enabled |
| Submitting | Button shows loading, disabled to prevent double-submit |
| API failure | Inline error status, form stays on screen for retry |

## Success page (#105:445)

- Success check icon + "Transfer Successful" + big amount.
- "Send to" recipient card + Transaction Details (Payment, Date, Time, Reference, Fee) + Total Payment.
- "Share" (out of scope / no-op) + "Back to Home".
- Reads the completed transfer result (passed from the POST response — via router state / query, not a re-fetch).

## Reusable UI components (`src/components/ui/` + `src/components/cashease/`)

Base (shadcn-derived): `Button`, `Input`/`Textarea`, `Card`, `Avatar`.
Composed (CashEase): `PurpleScreen`, `ScreenHeader`, `BalanceCard`, `TransactionRow`, `ContactRow`, `AmountInput`, `IconChip`, `NavBar`, `DetailRow`.

- Composition over boolean-prop soup; explicit `Button` variants (primary/outline/secondary).

## State management

- Clean React hooks. Local component state for the form; a small data-fetching hook (or SWR-style pattern) for API reads.
- Derived validation state computed during render (no effects for derivable values).

## Performance (bonus — manuscript "nilai tambah")

- Code splitting: `next/dynamic` for any heavy/non-critical UI.
- Memoization only where a real re-render cost exists (measured, not sprinkled).
- Parallel fetches on Home (user + transactions) — no waterfall.
- Skeleton/loading UI to improve perceived performance.

## Responsive design

- Mobile-first (Figma is a mobile app). Constrain to a phone-like column on desktop, or adapt to a centered card layout. Match Figma spacing/colours as closely as practical.

## Acceptance criteria

- [ ] Home shows balance + user from API with a visible loading state.
- [ ] Home handles error and empty states.
- [ ] Transfer type selector reachable from Home; "Transfer to Friends" → friends list.
- [ ] Friends list fetches contacts, supports search, handles loading/error/empty.
- [ ] Selecting a contact opens Set Amount with that recipient.
- [ ] "Proceed to Transfer" disabled by default, enabled only on valid amount.
- [ ] Amount < 10000 blocked with a clear error.
- [ ] Successful transfer navigates to the success receipt; failure shows an inline error.
- [ ] Success screen shows recipient, amount, and transaction details; "Back to Home" works.
- [ ] Reusable Button/Input/Card/Avatar used across all screens.
- [ ] Layout is usable on both mobile and desktop widths.

## Assumptions to record in README

- Mock API implemented as Next.js Route Handlers (not json-server) to keep one repo + one deploy.
- Full **friends** transfer flow implemented; **bank** flow excluded (card shown, out of scope).
- Disabled + error states on Set Amount are an extension (Figma shows only the default state).
- "Amount > balance" is also blocked (sensible for a wallet, though not explicitly in the brief).
- Auth/login is out of scope; a single seeded user is assumed logged in.
- Money is integer rupiah; no decimals/cents.
- Product Sans → Geist substitution (licensing).
- Success screen reads the POST result via router state, not a re-fetch.

## Skills in play

- `vercel-composition-patterns` — Button/Input/Card API design (compound components, variants over booleans, React 19 `use()` instead of `forwardRef`).
- `vercel-react-best-practices` — parallel fetching, loading/Suspense, memoization, code splitting, re-render hygiene.
- `web-design-guidelines` — dedicated review pass on the built UI (a11y, focus states, contrast, tap targets).
