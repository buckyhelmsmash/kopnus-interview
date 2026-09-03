# Question 4 — Performance Case Study

## The project this comes from

The examples below are from a real production app I worked on: an SME development platform — a dashboard-heavy web app where small businesses manage their programs, and staff review and report on them. Many pages are wide dashboards full of widgets (charts, a rich-text editor, a map), which is exactly the kind of page the question describes.

The stack that matters here: Next.js 15.3.3 (App Router, Turbopack), React 19, TanStack Query, Zustand for auth. And the usual suspects when a dashboard drags: two chart libraries (`react-apexcharts` and `recharts`), rich-text editors (`lexical` plus `@tiptap`), and a map library (`maplibre-gl`).

My contribution was the data-fetching layer. I moved us off scattered, per-component `fetch` calls onto a small **layered TanStack Query stack**, the same shape I use in this interview repo (`src/lib/query/`), where you can read the actual `ApiClient` in `src/lib/query/api-client.ts`.

### The fetching architecture (three layers, each knowing one thing)

- **`ApiClient`**: one thin wrapper over `fetch`, the only place that knows how to make a request. It throws on failure (so `useQuery`/`useMutation` can surface the error), and in the production app it also attached the login token to every request and unwrapped the API's `{ result: ... }` envelope. (The interview repo's `ApiClient` is the same file minus auth and envelope, because the CashEase mock has neither. See the scope note at the top of `api-client.ts`.)
- **Query-key factory + hooks**: the only place caching rules live. A stable cache key per resource, `useQuery` to read, `useMutation` to write, with invalidation on success.
- **Component**: asks a hook for `data`/`isLoading`/`error` and owns no fetching logic.

Why I built it: fetching was scattered, every component ran its own request, and data often didn't refresh after a save until you reloaded the page by hand. One entry point made things easy to debug, and stable cache keys kept the data fresh. The tool I leaned on to chase the cache problem was the TanStack Query Devtools, a small panel that shows the state of every cached request.

## Symptom summary

> **Scenario:** Aplikasi sudah digunakan oleh 100.000 users. Setelah release terbaru, beberapa user melaporkan bahwa halaman dashboard sangat lambat. API response hanya membutuhkan 200 ms, tetapi halaman membutuhkan 5–8 detik untuk tampil.

The API returns in 200 milliseconds but the page takes 5 to 8 seconds to show up. The backend is fast, so the problem lives on the client, in the browser. That 200 ms is only the time the server spends on one request. It says nothing about how many requests get chained one after another, how much JavaScript has to be downloaded and processed before anything appears, and how many times the page redraws itself. Those three things are where the missing 5 seconds hide.

## 1. What I check first

> **Pertanyaan:** Apa yang akan kamu cek terlebih dahulu?

I start with whatever is cheapest to look at.

First, the Network waterfall in Chrome DevTools. The Network tab lists every request the page makes and draws them as bars on a timeline, so you can see which ones wait for each other. The question is whether that 200 ms is one request or the dashboard firing a dozen requests in a chain. Our dashboard is full of widgets, and each widget fetches its own data. If those requests wait on each other instead of running side by side, 12 requests at 200 ms each plus network delay is already a few seconds on its own.

Second, JavaScript size and timing. Turbopack is fast during development, but the version shipped to real users can be much heavier. Charts, editors, and maps are big, and it's easy to miss that if you only test locally.

Third, I pin down where the slowness is. Slow only on the first load points to a big download or a chain of requests. Slow every time you change a filter or switch a tab points to the page redrawing more than it should.

Fourth, since the question says "after the latest release," I compare the code of the previous release against the current one with `git diff`. Did a heavy library sneak in? Did some data hook start refetching on a loop? Did a component lose the optimization that stops it redrawing? Regressions usually show up right here.

## 2. Telling frontend and backend apart

> **Pertanyaan:** Bagaimana membedakan masalah frontend dan backend?

| Signal | Verdict |
|---|---|
| The API's own response time in the Network tab is genuinely large | Backend |
| The server takes a long time to send the first byte, but the download itself is quick | Backend or network |
| Each API call is 200 ms but there are 15 of them, one after another | Frontend (how requests are orchestrated) |
| Downloading and running the JavaScript takes a long time | Frontend (bundle size or redraws) |
| The server responds fast but running JavaScript dominates the recording | Frontend |

The fastest way to split the two: open the Network tab and read the timeline per request. If every request really is 200 ms like the question claims, the backend is healthy. What's left is how many requests fire, when they fire, and how heavy the JavaScript is. All of that is frontend territory.

This isn't theory for me. Before we centralized into `ApiClient` plus TanStack Query, some pages hit the same endpoint several times because every component fetched on its own with no shared cache. Once we moved to shared hooks, those duplicate requests disappeared. Two components asking for the same data collapse into one request. That's TanStack's deduplication doing its job.

## 3. Tools I use

> **Pertanyaan:** Tools apa yang akan digunakan? (sebutkan yang spesifik untuk React/Next.js: React DevTools Profiler, Chrome DevTools Performance, Lighthouse, bundle analyzer, dsb.)

Chrome DevTools Network tab for the request timeline, the count of requests, how long each takes, its size, and spotting duplicates or chains.

Chrome DevTools Performance tab. You hit record, reload the page, and it draws a timeline of everything the browser did, split into running JavaScript, drawing the layout, and painting pixels. It also flags "long tasks," any single chunk of work that blocks the page for too long.

React DevTools Profiler to record an interaction and see which components redrew, how many times, and why. Turn on "Record why each component rendered," that's the setting that actually earns its keep.

TanStack Query Devtools to watch each cached request's state (fresh, stale, or currently fetching), whether anything refetches on a loop, and whether the cache key is stable. This was my main weapon when hunting the "data doesn't refresh after saving" bug.

`@next/bundle-analyzer`, a tool that draws a map of your JavaScript by size so you can see which library is making it fat.

Lighthouse, a built-in Chrome tool that scores page load speed. I run it before and after a fix to get numbers I can compare instead of guessing. It reports things like how long until the user sees the main content on screen, and how long the page is frozen and can't respond to clicks.

The `next build` command also prints a table of how much JavaScript each page ships, right in the terminal, so don't skip it.

## 4. What I look at in Chrome DevTools

> **Pertanyaan:** Apa yang akan dicek di Chrome DevTools?

In the Network tab I hunt three findings: whether requests run side by side or wait in a chain, which JavaScript file is biggest, and any request stalled because the browser caps how many run at once.

In the Performance tab I hunt long tasks — the chunks of work that freeze the page for more than a blink, usually heavy JavaScript or a big redraw — and read how much time goes to running JavaScript versus drawing. If JavaScript dominates, that's my target. The recording also shows how long the page sat frozen before it could respond to a click.

The Coverage tab gets forgotten a lot even though it's useful. It shows how much of the downloaded JavaScript the page never actually runs. If the charts, editor, and map all download when the top of the screen only shows a few numbers, those are strong candidates to load later instead of upfront.

## 5. Checking the JavaScript size in Next.js

> **Pertanyaan:** Bagaimana cara mengecek JavaScript bundle di proyek Next.js?

Start with the `next build` output. It prints how much JavaScript each page loads, and the dashboard page being much fatter than the others jumps out immediately.

After that, use `@next/bundle-analyzer`. Wrap `next.config.ts`:

```ts
import withBundleAnalyzer from '@next/bundle-analyzer'
const analyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default analyzer(nextConfig)
```

Run `ANALYZE=true next build`, then read the size map it opens in the browser. Look for big libraries that load on the first page view when they don't need to. In our project the prime suspects are the chart libraries, the editors, and the map. The Coverage tab confirms which of those actually run on the dashboard and which are just along for the ride.

The fixes I go with:

Load heavy components only when they're needed, not upfront. In Next.js that's `dynamic()`:

```ts
const ProgramChart = dynamic(() => import('./program-chart'), { ssr: false, loading: () => <ChartSkeleton /> })
```

Charts, editors, and maps don't belong in the first thing a user downloads. Load them on demand.

Make sure one page uses one chart library, not `apexcharts` and `recharts` on the same page. That's a classic trap that slips through review easily.

Import only the piece of a library you use, `import debounce from 'lodash/debounce'`, not the whole thing with `import _ from 'lodash'`.

## 6. Finding unnecessary redraws and fixing them

> **Pertanyaan:** Bagaimana cara menemukan unnecessary rendering (re-render) dan cara memperbaikinya?

When React redraws a component that didn't need to, the page does extra work for nothing. React calls this a re-render. There are two ways to find the wasteful ones.

First, the React DevTools Profiler. Turn on "Highlight updates when components render" and "Record why each component rendered," then record while switching a filter or tab. If one filter click redraws a dozen widgets whose data didn't change, that's wasted work.

Second, the TanStack Query Devtools. If a cached request keeps fetching when nothing asked it to, the cache key is usually unstable. Here's what that means. TanStack Query identifies each cached request by a "key," and if that key looks different on every render, TanStack thinks it's a brand-new request and fetches again. This happens when the key contains an object or array built fresh each time:

```ts
useQuery({ queryKey: ['someList', { id, filter: { date } }], ... })
```

That `filter` object is a new object on every render even when `date` is the same, so the key is never seen as equal. This is exactly the class of bug I dealt with while cleaning up fetching.

A few causes I actually hit in this project:

Unstable cache keys, as above. The fix is to build the key from plain values (a string, a number) instead of a fresh object, or wrap it in `useMemo` so React reuses the same object between redraws. This is also why I moved the query-parameter building into one shared helper, so the shape stays consistent and doesn't spawn new objects at random.

Passing a new object or function to a child component on every redraw, which defeats the optimization meant to skip it. The fix is `useCallback` for functions and `useMemo` for objects, both of which reuse the same value between redraws.

A component subscribed to the whole shared store redraws on any change at all. The fix is to subscribe only to the slice you need, `useAuthStore(s => s.token)` instead of grabbing everything.

State kept too high up in the tree. If the filter's state lives in a parent, changing it redraws the whole branch below. Push that state down as close to where it's used as you can.

One note: React 19 with its new compiler removes a lot of the manual work above, but a stable cache key and a narrow store subscription are still on you. The compiler doesn't cover those two.

## 7. Proving a fix actually made things faster, not just felt faster

> **Pertanyaan:** Bagaimana memastikan fix yang dibuat benar-benar meningkatkan performa? (wajib berikan contoh pengukuran sebelum/sesudah dari pengalaman nyata.)

The rule I hold to: never claim "faster" without a number. Measure the same way under the same conditions (Lighthouse lets you simulate a slow phone and a slow network, so the numbers are honest and repeatable), record before, apply the fix, record after.

### A real example from this project (work I actually did and measured)

The case: duplicate requests and wasteful redraws on a list page I moved from manual fetch to the `ApiClient` + TanStack Query stack. Before centralizing, each component called its own endpoint with no shared cache, and after a save the data often didn't refresh until a full page reload. What I measured in the Network tab and the React Profiler:

| Metric | Before | After | How measured |
|---|---|---|---|
| Requests when opening the list page | ~11 (many duplicates of the same endpoint) | ~4 | Network tab, counting requests |
| Duplicate requests to the same endpoint | yes, 3 to 4 times | 0, merged by TanStack Query | Network tab plus Query Devtools |
| Data refresh after create or update | inconsistent, sometimes needed a manual reload | automatic, the save tells the cache to refresh | Query Devtools, watching the request go stale then refetch |
| Redraws when changing pages | the whole list redrew | only the rows that changed | React Profiler |

The page-change fix came from telling TanStack Query to keep showing the previous page's data while the next one loads, plus tracking the page number locally. The result is that moving between pages doesn't flash a full loading screen and doesn't redraw the entire table.

### Proving the bundle fix for the symptom in the question (method, not a solo deliverable)

One honest distinction: the list-page numbers above are work I did and measured. The 5-to-8-second *dashboard* is the scenario the question invented. I never shipped a measured dashboard fix from 8s down to under 2.5s as a solo deliverable, so here I show the *method* I'd run, drawn from the same project's tooling and the dynamic-import fixes I have applied to heavy pages there:

Take a baseline first. Run `next build`, note how much JavaScript the dashboard page loads, then run Lighthouse with a slow-phone simulation and record its speed numbers.

Apply the fix. Load charts, editors, and maps on demand. Use one chart library. Make independent requests run side by side instead of in a chain. Stabilize the cache keys.

Measure again with identical settings.

The pass mark is clear. The dashboard's JavaScript drops a lot, the user sees the main content in under 2.5 seconds, and the frozen time drops sharply. If the numbers don't move, the fix isn't right yet and it shouldn't be merged. For me this isn't a formality. Merging without numbers just pushes the problem into the next release.

The report I send the team always looks the same: one before/after table with the tools and the numbers, plus before-and-after screenshots of the Performance recording so the long task that disappeared is visible to the eye.

## Quick checklist

- [ ] Check the Network timeline. One request or many in a chain?
- [ ] Check the Performance recording. Long tasks and how much time goes to JavaScript.
- [ ] `next build` plus `@next/bundle-analyzer`. Hunt heavy libraries in the first page load.
- [ ] Load charts, editors, and maps on demand, and use one chart library per page.
- [ ] React Profiler plus Query Devtools. Chase wasteful redraws and unstable cache keys.
- [ ] Measure before and after with Lighthouse plus `next build` on identical settings, and attach the numbers.
