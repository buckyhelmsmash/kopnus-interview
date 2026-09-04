# Spec: Dashboard Performance Demo (before/after) — Soal 4 evidence

## Goal

A pair of runnable dashboard pages inside this repo that **reproduce and then fix** the exact slowdowns described in the Soal 4 written answer (`SOAL-4.md`). One page is deliberately slow (`before`), one applies every fix (`after`). Both are profileable in Chrome DevTools / Lighthouse so the reviewer can verify the before/after numbers themselves instead of trusting a claim.

This exists because the candidate no longer has access to the original production app (an SME/UMKM internship-digitalization platform). The demo is a faithful, smaller reconstruction of that dashboard's shape — stat cards, a chart, a maplibre map — using the same fetching architecture the candidate actually built there.

## Routes (App Router)

| Route | Screen | Role |
| --- | --- | --- |
| `/dashboard` | Landing / chooser linking to both variants | index |
| `/dashboard/before` | The slow dashboard (all four sins) | bad example |
| `/dashboard/after` | The fast dashboard (all four fixes) | good example |

- Linked from the home page (`src/app/page.tsx`) as visible Soal-4 evidence, alongside a link to the written answer.
- Both variants render the **same four widgets** and read the **same mock API**, so the only difference measured is the frontend technique.

## The four widgets (both variants)

Anchored to the real production dashboard the candidate shared (5 stat cards fetched via separate hooks, a maplibre map with a carto tile style + no API key, a yearly chart):

1. **Stat cards row** — 4 number cards (e.g. Total UMKM, Total Mahasiswa, Total Mentor, Program Aktif). Each is one count.
2. **Yearly chart** — a shadcn chart (Recharts area/bar) over a small time-series (yearly AUM-style figures).
3. **Map** — `@vis.gl/react-maplibre` `<Map>` over Indonesia with a few province markers, carto positron tile style (`https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json`), **no API key/token**. This is the genuinely heavy WebGL widget that makes the bundle point honest.
4. **Recent activity list** — a short list (reuses the CashEase transaction row shape / mock).

## Mock API (Next.js Route Handlers under `src/app/api/dashboard/`)

Each handler sleeps to make the waterfall visible, mirroring the CashEase mock convention (`await new Promise(r => setTimeout(r, ms))`).

| Endpoint | Method | Returns | Delay |
| --- | --- | --- | --- |
| `/api/dashboard/stats` | GET | `{ umkm, students, mentors, programs }` counts | ~200 ms |
| `/api/dashboard/yearly` | GET | `[{ year, value }]` series for the chart | ~200 ms |
| `/api/dashboard/provinces` | GET | `[{ name, lng, lat, count }]` for map markers | ~200 ms |
| `/api/dashboard/activity` | GET | recent activity rows | ~200 ms |

- 200 ms per endpoint deliberately matches the "API response hanya 200 ms" claim in the scenario. The 5–8s must therefore come entirely from the frontend, which is the whole point.
- Data seeded from a new `src/mocks/dashboard.ts` module.

## The four sins (`before`) → the four fixes (`after`)

| # | Sin in `before` | Fix in `after` | Which measurement it moves |
| --- | --- | --- | --- |
| 1 | **Per-widget `useEffect` + `fetch`** — each widget fetches on mount inside its own `useEffect`, no shared cache; two widgets fetch the same endpoint independently, and React 19 StrictMode double-invokes the effect in dev, so the same call visibly fires 3–4× | Shared **TanStack Query hooks** keyed through a factory → dedup collapses duplicates into one in-flight request | Network: request count drops (~11 → ~4), duplicates → 0 |
| 2 | **Static imports** — chart + maplibre imported at the top of the module, so they land in the first JS bundle | **`dynamic()`** with `{ ssr: false }` + skeletons for chart and map | `next build` / bundle-analyzer: first-load JS of the page drops sharply |
| 3 | **Filter state too high** — a year/tab filter lives at the dashboard root, so changing it re-renders every widget (map + chart included) | Push filter state **down** to only the widget that needs it; narrow subscriptions | React Profiler: one filter change re-renders 1 widget, not all four |
| 4 | **Unstable query key** — key contains a fresh object each render (`{ filter: { year } }`) → refetch loop | Build the key from **plain values** / `useMemo` the params via one shared helper | Query Devtools: no refetch loop; key stays equal across renders |

- `before` and `after` are **separate component trees** (not a toggle), so the two builds are cleanly comparable and each is honest about its technique.
- Both share the mock API, the widget markup, and the seed data — only the fetching + import + state technique differs.

## Fetching architecture (the `after` variant)

Reuses the existing stack in `src/lib/query/` (per the `tanstack-query-fetching` skill):

- **`ApiClient`** (`src/lib/query/api-client.ts`) — already present; the demo's hooks call it, no changes needed.
- **Query-key factory** — add `dashboardKeys` to `src/lib/query/keys.ts` (`all`, `stats()`, `yearly(filters)`, `provinces()`, `activity()`).
- **Read hooks** — `src/lib/query/use-dashboard.ts`: `useDashboardStats`, `useDashboardYearly(filters)`, `useDashboardProvinces`, `useDashboardActivity`. Each keyed through the factory.
- **Components** — widgets consume `data`/`isLoading`/`error`, own no fetching.

The `before` variant deliberately **bypasses** this stack: each widget runs its own `useEffect(() => { fetch(...) }, [])` with local `useState` for data/loading, mirroring the exact pattern found in the original production app before the TanStack Query migration. No shared cache, so two widgets hitting the same endpoint each fire their own request (and StrictMode doubles them in dev).

## Dependencies to add

- `maplibre-gl` + `@vis.gl/react-maplibre` (the React wrapper the candidate used in production).
- shadcn `chart` component (`bunx --bun shadcn@latest add chart`) — wraps Recharts, which pulls `recharts` in.
- No API keys anywhere (carto tiles are free/keyless).

## How the numbers get produced (for the README table)

1. `bun run build` → record **First Load JS** for `/dashboard/before` vs `/dashboard/after` from the printed table.
2. `ANALYZE=true bun run build` (bundle-analyzer wired per the written answer) → confirm which lib dominates `before`.
3. Lighthouse (mobile preset, throttled) on each → record **FCP / LCP / TBT** before vs after.
4. Network tab → count requests + duplicates on each.
5. React Profiler → re-render count on a filter change, each variant.

These fill the `_Contoh nyata dengan angka before/after menyusul._` placeholder in `SOAL-4.md`.

## Acceptance criteria

- [ ] `/dashboard` links to both variants; both linked from home page.
- [ ] Both variants render 4 identical-looking widgets from the same mock API.
- [ ] Each mock endpoint delays ~200 ms to match the scenario.
- [ ] `before`: widgets fetch via per-component `useEffect` + `fetch` + `useState` (no shared cache), at least one endpoint requested by two widgets independently (visible duplicates in Network), chart+map statically imported, filter state at root, unstable key.
- [ ] `after`: shared TanStack Query hooks via `dashboardKeys`, chart+map via `dynamic({ ssr: false })` with skeletons, filter state pushed down, stable key.
- [ ] `bun run build` shows a clearly larger First Load JS for `before` than `after`.
- [ ] `bun run check` clean; no API keys committed.
- [ ] Before/after numbers captured and written into the Soal 4 markdown table.

## Assumptions to record in README

- Demo is a reconstruction, not the original production code (no longer accessible). Shape and technique mirror the real app; data is invented seed data.
- maplibre + carto keyless tiles chosen so the reviewer needs no signup/token to run it.
- The `before` variant is intentionally bad code, isolated under `/dashboard/before`, clearly labelled, and excluded from being an example of the candidate's normal style.
- 200 ms mock delay is chosen to match the scenario's stated API time; real network jitter aside, the frontend is the only variable between the two builds.

## Skills in play

- `tanstack-query-fetching` — the `after` fetching layer (factory → hooks → component), and the `before`'s deliberate violation of it.
- `vercel-react-best-practices` — dynamic import / code-splitting, re-render hygiene, stable keys, narrow subscriptions (the four fixes).
- `web-design-guidelines` — a quick pass so both dashboards are presentable.
