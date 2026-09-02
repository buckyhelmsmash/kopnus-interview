# Spec: E-Wallet App (CashEase) — Soal 3

## Goal

A responsive web app (mobile + desktop) based on the CashEase Figma, with at least two pages: **Home** and **Transfer**. Data comes from a self-made mock REST API with a simulated delay so loading states are visible.

Figma: https://www.figma.com/design/yssi3szWnG6f64W9ONygXV/E-Wallet-Mobile-Apps---CashEase--Community-

## Routes (App Router)

- `/cashease` — Home
- `/cashease/transfer` — Transfer

> Grouped under a `cashease` segment so the wallet app is self-contained and the root `/` can host a simple index linking to all four soal.

## Mock API

Implemented as Next.js **Route Handlers** under `src/app/api/` (Next 16 App Router; see `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` at build time). No external `json-server` needed — keeps it single-repo and deployable.

| Endpoint | Method | Returns / accepts |
| --- | --- | --- |
| `/api/user` | GET | User profile + balance. Simulate ~1–1.5s delay. |
| `/api/transactions` | GET | Recent transactions list (for Home). Simulated delay. |
| `/api/transfer` | POST | Accepts `{ amount, recipient }`. Validates server-side, returns success/failure. Simulated delay. |

- Delay via `await new Promise(r => setTimeout(r, ms))` inside the handler.
- Data seeded from a local JSON/TS module in `src/mocks/`.
- Money stored as integer rupiah (no floats).

## Home page

- Shows user info (name, avatar) and **balance**, fetched from the API.
- Shows recent transactions (or an empty state if none).
- Must handle **loading**, **error**, and **empty** states explicitly.
- Currency formatted as IDR (`Rp` + thousands separators).

## Transfer page

Form with these rules (all from the manuscript):

- "Proceed to transfer" button is **disabled by default**, enabled **only** when the entered amount is valid.
- Transfer **not allowed if amount < Rp10.000** — show a clear error message.
- On confirm, POST to `/api/transfer`; show success/failure status.
- Handle loading (submitting) state on the button.

### Validation rules

| Condition | UI behaviour |
| --- | --- |
| Empty / non-numeric amount | Button disabled, no error yet (or gentle hint) |
| Amount < 10000 | Button disabled + visible error "Minimum transfer is Rp10.000" |
| Amount > balance | Button disabled + error "Insufficient balance" (assumption) |
| Valid amount | Button enabled |
| Submitting | Button shows loading, disabled to prevent double-submit |

## Reusable UI components (`src/components/ui/`)

- `Button` — variant-based (primary/secondary/ghost), loading + disabled states. Composition over boolean-prop soup.
- `Input` — labelled, error slot, currency-aware variant for the amount field.
- `Card` — surface container used for balance card, transaction rows, form panel.
- Others as needed: `Avatar`, `Badge`, `Spinner`/skeleton.

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
- [ ] Transfer button disabled by default, enabled only on valid amount.
- [ ] Amount < 10000 blocked with a clear error.
- [ ] Successful transfer shows success status; failure shows failure status.
- [ ] Button/Input/Card are reused across both pages.
- [ ] Layout is usable on both mobile and desktop widths.

## Assumptions to record in README

- Mock API implemented as Next.js Route Handlers (not json-server) to keep one repo + one deploy.
- "Amount > balance" is also blocked (sensible for a wallet, though not explicitly in the brief).
- Auth/login is out of scope; a single seeded user is assumed logged in.
- Money is integer rupiah; no decimals/cents.

## Skills in play

- `vercel-composition-patterns` — Button/Input/Card API design (compound components, variants over booleans, React 19 `use()` instead of `forwardRef`).
- `vercel-react-best-practices` — parallel fetching, loading/Suspense, memoization, code splitting, re-render hygiene.
- `web-design-guidelines` — dedicated review pass on the built UI (a11y, focus states, contrast, tap targets).
