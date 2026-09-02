# Spec: Performance Case Study (written) — Soal 4

## Goal

A **written** answer in the README (section: Studi Kasus Performa) responding to the scenario:

> App with 100.000 users. After a release, the dashboard is very slow. API responds in 200ms, but the page takes 5–8 seconds to render.

The manuscript requires **real examples from a project you actually worked on**, with **specific tools and before/after metrics**. Generic/hypothetical answers are **disqualified**.

> ⚠️ This is the one task the AI cannot fabricate. The concrete numbers, tools, and story MUST come from Bucky's real experience. The agent's job is to structure and articulate — NOT invent metrics.

## Questions to answer (each needs a concrete example)

1. What do you check first?
2. How do you tell frontend vs backend problems apart?
3. Which tools? (Next.js/React-specific: React DevTools Profiler, Chrome DevTools Performance, Lighthouse, `@next/bundle-analyzer`, etc.)
4. What do you check in Chrome DevTools?
5. How do you inspect the JS bundle in a Next.js project?
6. How do you find unnecessary re-renders and fix them?
7. How do you prove the fix actually improved performance? (**before/after measurement required**.)

## Structure plan for the README section

1. **Triage order** — since API is 200ms, the bottleneck is frontend/render/network-waterfall, not backend. State how you'd confirm that.
2. **Frontend vs backend split** — Network tab timing (TTFB vs. content paint), server timing headers, comparing API latency to total load.
3. **Toolbox** — name specific tools and what each reveals.
4. **Chrome DevTools checklist** — Network waterfall, Performance flame chart, long tasks, main-thread blocking, LCP/TBT.
5. **Bundle inspection** — `@next/bundle-analyzer`, `next build` output, route-level JS size, barrel-import bloat.
6. **Finding re-renders** — React DevTools Profiler (highlight updates, ranked chart), the "why did this render" flow; fixes: memoization, state colocation, context splitting, deferring reads.
7. **Proving the fix** — one real before/after table (metric, tool, before, after).

## What Bucky needs to supply (INTERVIEW-CRITICAL)

Bucky must provide a **real story** with numbers. Template to fill:

- Project + context: _____
- Symptom + how discovered: _____
- Tool used to diagnose: _____
- Root cause found: _____
- Fix applied: _____
- **Before metric**: _____ (e.g. LCP 6.2s, bundle 780kB, 40 re-renders)
- **After metric**: _____ (e.g. LCP 1.8s, bundle 210kB, 3 re-renders)
- Tool used to measure before/after: _____

## Acceptance criteria

- [ ] Every one of the 7 questions is answered.
- [ ] At least one real project example with named tools.
- [ ] At least one before/after metric table with actual numbers.
- [ ] Answers are specific to React/Next.js, not generic web advice.

## Skills in play

- `vercel-react-best-practices` — reference for correct vocabulary and the specific rule categories (waterfalls, bundle, re-render) to frame the answer credibly. Reference only; the lived example is Bucky's.
