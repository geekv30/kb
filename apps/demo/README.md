# @test-kb-ui/kb-demo

A standalone Vite + React 18 application that consumes [`@test-kb-ui/kb-ui`](../../packages/kb-ui) the way an external Hiver engineer would — `import { ... } from '@test-kb-ui/kb-ui'`. It stitches every pattern shipped in kb-ui's Phases 3–7 into a single navigable product so the library can be experienced end-to-end without opening Storybook. This app is the integration test for the Phase 8 npm publish: if it consumes the workspace package cleanly, downstream users will too.

For the full design contract see [`demo-app-prd.md`](../../demo-app-prd.md) (PRD) and [`demo-app-trd.md`](../../demo-app-trd.md) (TRD).

## Quickstart

Run from the repo root (workspace-aware) or from this directory.

```bash
# from repo root — install once across the whole workspace
npm install

# start the dev server (Vite, HMR)
npm run dev --workspace=apps/demo
# then open http://localhost:5173

# type-check + production build to apps/demo/dist
npm run build --workspace=apps/demo

# serve the production bundle locally
npm run preview --workspace=apps/demo

# type-check only, no emit
npm run typecheck --workspace=apps/demo
```

## Deploy

`npm run build --workspace=apps/demo` emits a fully static bundle to `apps/demo/dist/` (`index.html` + `assets/`). Serve that directory from any static host — Vercel, Netlify, GitHub Pages, S3 + CloudFront, or `npx serve dist`. There is no server runtime; the SPA is hash-free, so the host must rewrite unknown paths to `index.html` for client-side routing to work (Vercel/Netlify do this by default; for `serve` use `serve -s dist`).

## Routes

| Path | Page | Notes |
| --- | --- | --- |
| `/` | redirect → `/kb/getting-started` | RedirectToDefault |
| `/kb/:topLevel` | Category page (top level) | PageHeader + SubCategoriesTable + ArticlesTable |
| `/kb/:topLevel/:mid` | Category page (depth 1) | same composition, deeper breadcrumb |
| `/kb/:topLevel/:mid/:depth2` | Category page (depth 2) | leaf categories — `permissions-access`, `creating-shared-inboxes`, etc. |
| `/articles/:slug/edit` | Editor (collapsed shell) | ContentEditor + ArticleSettingsPanel + Save / Publish / Close |
| `/ai-optimise` | AI Optimise hub | One SuggestionCard per article with pending suggestions |
| `/ai-optimise/:slug/review` | AI Gaps interactive review (collapsed shell) | Reducer-driven accept / reject / undo / publish flow |
| `/analytics/article-performance` | Analytics tab 1 (default) | StatCardGrid + AnalyticsAreaChart + Donut + 2 tables |
| `/analytics/search` | Analytics tab 2 | Search-volume metrics + 2 tables |
| `/analytics/ai-answer-performance` | Analytics tab 3 | AI deflection metrics + AIConversationLogsCard + MostCitedArticlesTable |
| `/settings` | Settings placeholder | Single "Coming soon" panel — Phase 8/9 territory |
| `*` | Branded 404 | NotFoundPage rendered standalone (no shell) |

## Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| Build / dev server | Vite | ^5.0 |
| UI runtime | React + ReactDOM | ^18.3 |
| Language | TypeScript (strict) | ^5.4 |
| Routing | React Router (data router) | ^6.26 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | ^4.0 |
| State | React Context + `useReducer` (custom MockStore) | n/a |
| Component library | `@test-kb-ui/kb-ui` | workspace `*` link |

No additional runtime dependencies. Tiptap, Recharts, Radix primitives, and `@remixicon/react` come transitively through `@test-kb-ui/kb-ui`.

The kb-ui package is consumed via npm workspaces — there is no build step coupling between the two; the demo simply imports from `@test-kb-ui/kb-ui` and Vite resolves it through `node_modules` like any other package.

## Mock data

All demo data lives in `src/store/fixtures/` and is seeded once on app mount via `useReducer(_, _, () => seed())`. Fixtures cover:

- **6 users** — Aanya Krishnan (current persona), Mira Rao, Tarun Shah, Devika Iyer, Rohan Mehta, Sana Pillai
- **23 categories** — 5 top-level + 14 mid-level + 4 depth-2 (full PRD §5.1 tree)
- **17 articles** — one per leaf category, with realistic Hiver vocabulary and 200–600 words of substantive HTML
- **9 AI suggestions across 3 articles** — password reset, auto-reply rules, chat widget — each with addition / replace / removal types
- **12 conversation sources** — 4 per AI-targeted article, with sender, timestamp, subject, snippet
- **Analytics** — static fixtures for stat cards, area chart series, donut data, and all four analytics tables; row references resolve to real article slugs so deep-links from analytics tables work

**A page refresh wipes everything back to seed.** This is intentional — demo determinism beats "remembers my changes." See PRD §10 decision 10.

## Production-grade polish (Phase 7.5.8)

- Top-right toast component (success / info / error variants, 3s autohide, 5s on errors, hover pauses)
- Branded `ConfirmDialog` (Radix-themed) for unsaved-changes guard — replaces `window.confirm`
- Keyboard shortcuts: `Cmd/Ctrl+S` (save draft), `Cmd/Ctrl+Enter` (publish), `?` (open cheat sheet), `Esc` (close modals)
- Code-split per route via `React.lazy()` — initial bundle ships only the shell + redirect
- 150ms cross-fade transition on route swaps
- Focus management: `<h1>` on every navigation, Tiptap caret on editor mount
- Empty states everywhere PRD §12.5 lists (categories, hub, analytics tables, 404)
- Error boundary per leaf route — keeps the shell mounted on render failure

## Verification scripts

`apps/demo/scripts/` contains Playwright walkers for each phase. Run them against a live dev server:

```bash
# in one terminal
npm run dev --workspace=apps/demo

# in another
node apps/demo/scripts/phase-7-5-5-verify.mjs   # Journey A (editor)
node apps/demo/scripts/phase-7-5-8-verify.mjs   # Phase 7.5.8 polish (toast, dialog, cheat sheet, 404)
node apps/demo/scripts/phase-7-5-9-signoff.mjs  # ALL three journeys end-to-end (canonical sign-off)
```

The `phase-7-5-9-signoff.mjs` script is the single source of truth for journey completeness — it spawns its own dev server, walks all 3 journeys cold, and prints PASS/FAIL per PRD §6 step.
