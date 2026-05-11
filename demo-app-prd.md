# demo-app-prd.md — Hiver KB Demo Web App

> **Status:** DRAFT v1 — needs user refinement before TRD.
> **Purpose of this doc:** Pin down every user flow, action, and edge case the `apps/demo` web app must handle, end-to-end, before any code is written. This is the contract the TRD and the ui-engineer dispatches will both be measured against.

---

## 1. Overview

### 1.1 What this is

A standalone web app inside this monorepo (`apps/demo`) that consumes `@test-kb-ui/kb-ui` exactly the way an external Hiver engineer would (`import { ... } from '@test-kb-ui/kb-ui'`). It stitches every pattern shipped in Phases 3–7 into a single navigable product so a viewer can experience the KB end-to-end without ever opening Storybook.

### 1.2 Why it exists

1. **Fidelity check.** Storybook frames are isolated. Stitching them surfaces transition gaps, prop holes, and "the whole thing doesn't quite feel right" issues that per-component audits hide.
2. **Phase 8 integration test.** If the demo can consume `@test-kb-ui/kb-ui` cleanly, downstream users will too. Catches barrel-export and peer-dep bugs before npm publish.
3. **Sales / stakeholder asset.** A clickable URL that shows what the library can do beats a Storybook tour.
4. **Phase 9 fixture seed.** The mock data and route map become the canonical "what does a real KB feature look like" reference for the MCP companion server.

### 1.3 Success criteria

- A first-time viewer can complete all three primary journeys (browse-and-edit, AI optimise, analytics) without instructions.
- Every interactive element on every page has a wired outcome (no `console.log` placeholders).
- The demo runs fully offline against in-memory mock data — no network calls, no flakiness during a live demo.
- `vite build` produces a static bundle deployable to any static host.

### 1.4 Non-goals

This is not a production app. It is not a reference implementation of how Hiver should structure the real KB. It is a demonstration harness for the component library.

---

## 2. Personas

The demo has **one** persona: **KB Admin**. Same human throughout. Logged in implicitly, no auth screens, no account switcher. Every action is performed as this admin. Read-only end-user views are explicitly out of scope (see §4.2).

---

## 3. Scope

### 3.1 In scope (the happy path)


| Surface                               | Source pattern                                  | Interactive depth                                                                       |
| ------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Category page**                     | `Patterns/KB Category Page`                     | Browse subcategories + articles, open article for editing, create new article (stub)    |
| **Editor page**                       | `Patterns/KB Editor Page`                       | Full Tiptap editing, settings panel field edits, save draft, publish, close-with-guard  |
| **AI Optimise Hub**                   | `Patterns/KB AI Optimise Hub`                   | Browse suggestion cards, click card → enter AI Gaps review for that article             |
| **AI Gaps Interactive**               | `Patterns/KB AI Gaps -- interactive`            | Full reducer-driven review loop, keyboard shortcuts, sources sheet, publish back to hub |
| **Analytics — Article Performance**   | `Patterns/KB Analytics — Article Performance`   | View metrics, switch between analytics tabs, drill from article row → editor            |
| **Analytics — Search**                | `Patterns/KB Analytics — Search`                | View metrics, switch tabs                                                               |
| **Analytics — AI Answer Performance** | `Patterns/KB Analytics — AI Answer Performance` | View metrics, switch tabs                                                               |


### 3.2 Out of scope (explicit — do not build)


| Excluded                                     | Reason                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Authentication / login screens**           | Not a kb-ui library concern                                                                             |
| **Search** (search bar input + results page) | No search component shipped in kb-ui; would require new build                                           |
| **Settings page content**                    | Rail icon stays present but click is a no-op (or routes to a "Coming soon" placeholder)                 |
| **AI Centre hub**                            | Sub-nav `kind: 'section'` row stays visible (per Figma fidelity) but click is a no-op                   |
| **KB Listing / multi-category landing**      | No such pattern in kb-ui; demo opens directly into a populated category                                 |
| **Article read-only viewer**                 | Product is a KB editor; "view" = "open in editor"                                                       |
| **Drag-and-drop** of articles or folders     | No DnD primitives shipped                                                                               |
| **Real Figma / Slack integrations**          | All sources are mock data                                                                               |
| **Multi-user collaboration / presence**      | Single persona                                                                                          |
| **Version history / autosave drafts**        | Editor state is in-memory only; close-with-guard prompts on dirty                                       |
| **Dark mode toggle**                         | Light theme only (matches all Figma references)                                                         |
| **Mobile / responsive**                      | Desktop only, target viewport 1280+                                                                     |
| **i18n / localization**                      | Hardcoded English copy (matches kb-ui stories)                                                          |
| **Toast / notification system**              | Use `console.log` for save/publish confirmations OR a single tiny inline toast — see §10 open questions |
| **Browser tab title sync**                   | Static title throughout                                                                                 |


### 3.3 What we change vs. Storybook

The demo runs *real* navigation and *real* state mutations against a mock store. Specifically:

- Publishing an article in the editor flips its status badge from `draft` → `published` and is reflected on the category page when the user navigates back.
- Accepting/dismissing AI suggestions in the Gaps flow updates the suggestion-list count on the AI Optimise hub when the user returns.
- The active suggestion / AI Gaps mid-flow state persists per article (see §8.5) so a user can navigate away and resume.

### 3.4 Quality bar: real, not stubbed (refinement 2026-04-26)

**This is the bar.** The demo must be indistinguishable from a production app with a real backend. The three rules below override anything else in this PRD:

1. **Real data.** Every category, subcategory, article, author, suggestion, and analytics row uses realistic, in-domain content (Hiver = customer support tooling). No `Lorem ipsum`, no `Article 1 / Article 2 / Article 3`, no placeholder names. Article bodies are substantive HTML (multi-paragraph, with headings, lists, links). Authors have real-sounding names. Dates are recent and varied.
2. **Real actions.** Every interactive element either mutates state, navigates, or surfaces feedback (toast). **Zero `console.log` placeholders for user-facing actions.** A click that "does nothing" is acceptable only if the PRD explicitly marks the element as `no-op v1` AND the click surfaces a "Coming soon" toast (so the viewer knows the click registered).
3. **Real states.** Every page handles empty / loading / error / success states with intentional design — not blank screens or browser-default 404s. Status badges flip live. Counts update live. Tree expansion persists across navigation within the session.
4. **Real navigation depth (Journey A is the demo's flagship).** The explorer tree must show **multiple top-level categories**, each with **multiple subcategories at depths 2–3**, and **every node must be navigable to a populated destination**. No empty stubs in the tree. The viewer must be able to wander the KB the way a real admin would.
5. **Production-grade polish.** Focus management on route change. Smooth transitions (no flash on nav). Toast notifications for save/publish. Keyboard shortcuts where the product would have them. Intentionally-styled 404. Code-split per route so the initial bundle is small. See §12 for the full polish spec.

**Stakes:** this demo is the cornerstone of a $500 MRR feature extension. Treat every shortcut as a real cost, not a saved minute.

---

## 4. Information Architecture

### 4.1 Sitemap

```
/                                         → redirect to /kb/managing-emails
/kb/:categorySlug                         → Category page
/kb/:categorySlug/:articleSlug/edit       → Editor page (single mode — edit)
/ai-optimise                              → AI Optimise Hub
/ai-optimise/:articleSlug/review          → AI Gaps interactive review
/analytics/article-performance            → Analytics tab 1 (default)
/analytics/search                         → Analytics tab 2
/analytics/ai-answer-performance          → Analytics tab 3
/settings                                 → Coming soon placeholder (or redirect home)
```

### 4.2 Why no `/articles/:slug` read-only view

Hiver KB is an **authoring** tool. The "consumer" of an article (an end-user reading help docs) lives on a different product surface that this library doesn't cover. For the admin persona this demo serves, "view article" = "open in editor."

### 4.3 Route → top-level section mapping

Each route belongs to a section, which determines which icon is active on the rail:


| Route prefix     | Rail-active icon |
| ---------------- | ---------------- |
| `/kb/`*          | Editor           |
| `/ai-optimise/`* | AI               |
| `/analytics/*`   | Analytics        |
| `/settings`      | Settings         |


### 4.4 Sub-nav per section


| Section   | Sub-nav (288px column)                                                            |
| --------- | --------------------------------------------------------------------------------- |
| Editor    | `FileExplorerNav` (hierarchical tree of categories + articles)                    |
| AI        | `AISubNav` (2 items: AI Centre [no-op], AI Optimise [active])                     |
| Analytics | `FileExplorerNav variant="flat"` (3 flat items: Article Views, Search, AI Answer) |
| Settings  | (collapsed shell — no sub-nav)                                                    |


### 4.5 Collapsed-shell routes

The Editor route (`/kb/.../:articleSlug/edit`) and AI Gaps Interactive route (`/ai-optimise/:articleSlug/review`) render in **collapsed-shell mode**: rail and sub-nav unmounted, content spans full viewport, breadcrumb leading icon = home (per `KBBreadcrumbBar.sidebarCollapsed=true`). This matches the existing pattern stories.

---

## 5. Mock Data Model

All data lives in a single in-memory store, seeded on app load. **Refresh wipes everything back to seed.** No localStorage. Demo determinism beats "remembers my changes."

### 5.1 Entities

**Category**

```
id, slug, title, subtitle, parentId | null, depth (0|1|2|3)
```

Tree shape (every leaf-or-branch is navigable to a populated category page; no empty stubs):

```
Getting Started (depth 0)
├── Setting up Hiver (depth 1) — 4 articles
├── Inviting your team (depth 1) — 3 articles
└── Connecting your inbox (depth 1) — 5 articles

Managing Emails (depth 0)
├── Shared inboxes (depth 1)
│   ├── Creating shared inboxes (depth 2) — 4 articles
│   └── Permissions & access (depth 2) — 3 articles
├── Email templates (depth 1) — 5 articles
└── Auto-assignment rules (depth 1) — 3 articles

Live Chat & Multi-channel (depth 0)
├── Live chat setup (depth 1) — 4 articles
├── WhatsApp integration (depth 1) — 3 articles
└── SMS & voice (depth 1) — 2 articles

Automations & Workflows (depth 0)
├── Rule-based automations (depth 1) — 5 articles
├── SLAs & escalations (depth 1)
│   ├── SLA policies (depth 2) — 3 articles
│   └── Escalation triggers (depth 2) — 2 articles
└── Notifications (depth 1) — 3 articles

Reporting & Analytics (depth 0)
├── Standard reports (depth 1) — 4 articles
└── Custom dashboards (depth 1) — 3 articles
```

Total: **5 top-level categories, 14 mid-level categories, 4 depth-2 subcategories, ~56 articles.** Realistic depth + breadth that matches how a real Hiver KB would be organized.

**Article**

```
id, slug, categoryId, title, status: 'draft' | 'published',
authorId, lastUpdatedAt, bodyHTML,
settings: { slug, tags[], publishDate, seoTitle, visibility, reviewerIds[] }
```

~~56 articles distributed across categories. **Per-category mix:** ~70% published, ~30% draft, varied last-updated dates spanning the last 90 days. **Body content:** every article has 200–600 words of substantive HTML — multiple paragraphs, at least one heading, a list, and a link. The 3 AI-targeted articles (see AISuggestion) have richer bodies (~~600 words) so the inline suggestion blocks have room to breathe.

**User** (for author/reviewer avatars)

```
id, name, initials, avatarColor
```

**6 users seeded** with realistic names: Aanya Krishnan (AK), Mira Rao (MR), Tarun Shah (TS), Devika Iyer (DI), Rohan Mehta (RM), Sana Pillai (SP). Article authorship distributed across all 6.

**AISuggestion**

```
id, articleId, type: 'addition' | 'replace' | 'removal',
title, description, anchorBlockId, payload, sourceCount,
status: 'pending' | 'accepted' | 'dismissed' | 'published'
```

**3 distinct articles each with their own 3-suggestion fixture (per refinement 2026-04-26):**

1. `managing-emails / shared-inboxes / how-to-reset-your-password` — 3 suggestions (addition, replace, removal) targeting the password reset flow
2. `automations-workflows / rule-based-automations / setting-up-auto-reply-rules` — 3 suggestions clarifying trigger logic
3. `live-chat-multi-channel / live-chat-setup / customizing-the-chat-widget` — 3 suggestions adding accessibility guidance

Total **9 suggestions across 3 articles**. AI Optimise hub renders **3 cards** (one per article), each card click enters Gaps review for THAT article with ITS 3 suggestions. Each article has its own independent reducer state in the mock store (so the user can review article #1, leave mid-flow, review article #2, return to article #1 and resume).

**ConversationSource**

```
id, sender, timestamp, subject, snippet
```

**12 sources total**: 4 distinct sources per article, real-sounding email subjects and customer snippets relevant to the article's topic. (E.g., password-reset article sources are real-sounding customer emails about login issues.)

**Analytics fixtures**
Static JSON blobs per analytics page. No mutation. (Stat cards, area-chart series, donut data, rows for all 4 analytics tables.) **Article references in analytics tables (ArticlesNeedsAttentionTable, ArticlePerformanceTable, MostCitedArticlesTable) point to real article IDs in the article store** — so clicking a row deep-links into the correct editor.

### 5.2 Mutations the demo must support


| Action                                | Effect on store                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publish article in editor             | `article.status` → `'published'`, `lastUpdatedAt` → now                                                                                                          |
| Save draft in editor                  | `article.bodyHTML` and `settings` updated, `status` unchanged                                                                                                    |
| Edit settings field                   | `article.settings.<field>` updated                                                                                                                               |
| Accept suggestion                     | `suggestion.status` → `'accepted'`                                                                                                                               |
| Dismiss suggestion                    | `suggestion.status` → `'dismissed'`                                                                                                                              |
| Undo decision                         | `suggestion.status` → `'pending'`                                                                                                                                |
| Publish from AI Gaps                  | All suggestions on that article with status `'accepted'` → `'published'`, article body re-rendered with accepted changes applied, article.status → `'published'` |
| Reset AI Gaps (close × on breadcrumb) | All suggestions for that article → `'pending'`                                                                                                                   |


### 5.3 Derived state (no separate storage)

- AI Optimise hub suggestion count = `count of articles where any suggestion has status='pending'`
- Article status badge on category page = `article.status`
- AISuggestionsCard "(N)" count = `count of suggestions on this article where status !== 'published'`

---

## 6. User Journeys

Three primary happy paths. Each must be completable end-to-end with no console-log placeholders.

### Journey A — Browse & Edit (FLAGSHIP — must feel like a real KB)

**Goal:** Admin lands, browses the KB tree across multiple categories and depths, opens one article, creates a new one, edits and publishes.


| #   | User action                                                                 | System response                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Loads `/`                                                                   | Redirects to `/kb/getting-started`. Rail "Editor" active. Explorer shows the FULL tree (5 top-level categories: Getting Started / Managing Emails / Live Chat & Multi-channel / Automations & Workflows / Reporting & Analytics) with `Getting Started` expanded by default. Breadcrumb: "Getting Started". Content: PageHeader + 3 SubCategoryRows + (no top-level articles in Getting Started; user drills down). |
| 2   | Clicks chevron on `Managing Emails` in explorer tree                        | Tree expands locally. Reveals 3 child folders: Shared inboxes / Email templates / Auto-assignment rules. Tree expansion state persists in MockStore for the session.                                                                                                                                                                                                                                                |
| 3   | Clicks chevron on `Shared inboxes`                                          | Reveals 2 depth-2 child folders: Creating shared inboxes / Permissions & access.                                                                                                                                                                                                                                                                                                                                    |
| 4   | Clicks `Permissions & access` (depth-2 folder row)                          | Navigates to `/kb/managing-emails/shared-inboxes/permissions-access`. Breadcrumb: "Managing Emails / Shared inboxes / Permissions & access" (3 segments, all clickable). Content: PageHeader + 0 SubCategoriesTable (none nested) + ArticlesTable with 3 real articles.                                                                                                                                             |
| 5   | Clicks a different top-level category row (e.g., `Automations & Workflows`) | Navigates to `/kb/automations-workflows`. Breadcrumb updates. Tree highlights that category. Previously-expanded `Managing Emails` stays expanded (session persistence).                                                                                                                                                                                                                                            |
| 6   | Clicks `Rule-based automations` subcategory in tree                         | Navigates to `/kb/automations-workflows/rule-based-automations`. Content shows 5 articles.                                                                                                                                                                                                                                                                                                                          |
| 7   | Clicks an article row ("Setting up auto-reply rules")                       | Navigates to `/kb/automations-workflows/rule-based-automations/setting-up-auto-reply-rules/edit`. Shell collapses. Editor opens with article's real body HTML (~400 words, multi-paragraph). Settings panel populated.                                                                                                                                                                                              |
| 8   | Types in editor body                                                        | Editor marks dirty. "Save as draft" enables.                                                                                                                                                                                                                                                                                                                                                                        |
| 9   | Edits a settings field (changes a tag)                                      | Settings panel reflects update. Mock store updated optimistically. Editor stays dirty.                                                                                                                                                                                                                                                                                                                              |
| 10  | Presses Cmd/Ctrl+S                                                          | Triggers "Save as draft". Mock store: bodyHTML + settings persisted. Toast "Draft saved." Editor clean again.                                                                                                                                                                                                                                                                                                       |
| 11  | Clicks "Publish"                                                            | Mock store: status → published, lastUpdatedAt → now. Toast "Published." Navigates back to category page (`/kb/automations-workflows/rule-based-automations`). Article row's status badge now shows `Published`.                                                                                                                                                                                                     |
| 12  | Clicks `Getting Started` → `Setting up Hiver` in tree                       | Navigates to that category page.                                                                                                                                                                                                                                                                                                                                                                                    |
| 13  | Clicks "+ New" in PageHeader                                                | Mock store: creates new article (slug `untitled-N`, title "Untitled article", body empty, status draft, author = current user). Navigates immediately to its editor at `/kb/getting-started/setting-up-hiver/untitled-1/edit`. Shell collapses. Editor empty, focused on title-or-first-block.                                                                                                                      |
| 14  | Types a title and body                                                      | Editor dirty. Mock store updates on save.                                                                                                                                                                                                                                                                                                                                                                           |
| 15  | Clicks "×" close before saving                                              | Confirm dialog "Discard changes? This will delete the new draft." → on confirm: mock store removes the empty draft, navigates back to category. On cancel: stays on editor. (Empty new drafts are removed if discarded; partially-saved drafts are kept as drafts.)                                                                                                                                                 |
| 16  | Clicks browser back                                                         | React Router native: returns to previous route. Unsaved-changes guard still applies.                                                                                                                                                                                                                                                                                                                                |


### Journey B — AI Optimise Review

**Goal:** Admin reviews AI-generated suggestions for an article, accepts some, dismisses others, publishes.


| #   | User action                                        | System response                                                                                                                                                                                                                                                                                                                     |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Clicks "AI" rail icon                              | Navigates to `/ai-optimise`. Rail "AI" active. Sub-nav: AI Centre (visible, no-op) + AI Optimise (active). Breadcrumb: "AI Optimise". Content: page header + 3 SuggestionCards.                                                                                                                                                     |
| 2   | Clicks a SuggestionCard                            | Navigates to `/ai-optimise/reset-password/review`. Shell collapses. Article body renders with 3 inline highlight blocks (s1 green, s2 red+green, s3 red), all in inactive state. Right rail: collapsed Settings panel + AISuggestionsCard (mode='pre-review', count=3). Breadcrumb editor variant, Publish disabled.                |
| 3   | Clicks "Review Suggestions (3)"                    | Reducer dispatches `review`. Mode → reviewing. activeIndex → 0. Article body scrolls s1 into view (smooth, center). Right rail: AIGapSuggestionCard for s1 (full controls) + dimmed preview of s2.                                                                                                                                  |
| 4a  | Clicks ✓ on s1 (or presses `y` / Enter)            | Reducer dispatches `accept(s1)`. s1 status → accepted. activeIndex → 1 (next undecided). Article body: s1 highlight gone, plain accepted text in place. Scrolls s2 into view. Publish button on breadcrumb ENABLES. Rail: s1 chip (accepted, undo) + s2 active card.                                                                |
| 4b  | Clicks × on s2 (or presses `n`)                    | Reducer dispatches `reject(s2)`. s2 → dismissed. activeIndex → 2. s2 highlight gone, original text restored. Scrolls s3. Rail: s1 chip + s2 chip + s3 active card.                                                                                                                                                                  |
| 5   | Clicks "📄 4 Sources" on active card               | Reducer dispatches `openSources(activeId)`. SourcesSideSheet slides in from right (400px, dark backdrop). Body: 4 conversation cards. activeIndex unchanged.                                                                                                                                                                        |
| 6   | Presses Escape (or clicks ×)                       | Reducer dispatches `closeSources`. Sheet closes.                                                                                                                                                                                                                                                                                    |
| 7   | Clicks ▼ (or presses `j`)                          | Reducer dispatches `next`. activeIndex cycles forward modulo 3 (wraps; navigable through decided slots too — they show as chips, not active). Scrolls.                                                                                                                                                                              |
| 8   | Clicks ↶ on s1 chip                                | Reducer dispatches `undo(s1)`. s1 → pending. mode stays reviewing. activeIndex → 0. s1 highlight returns. Publish button MAY disable if no other accepts remain.                                                                                                                                                                    |
| 9   | All 3 decided                                      | Reducer auto-transitions to terminal. Right rail: AISuggestionsCard mode='terminal' (✓ Reviewed All disabled pill) + 3 chips below. Article body shows final state (accepted changes applied, dismissed reverted). Main scrolls to top.                                                                                             |
| 10  | Clicks "Publish"                                   | Mock store: all accepted suggestions → published, article body re-rendered with accepted changes applied permanently, article.status → published. Toast "Published." Navigates to `/ai-optimise`. Hub shows fewer cards (or zero if this was the only article with pending suggestions; in that case, show empty state — see §9.4). |
| ALT | Clicks × close on breadcrumb instead of publishing | If any decisions made: confirm dialog "Discard review?" → on confirm, reducer dispatches `reset` (all suggestions for this article → pending), navigate to `/ai-optimise`. If no decisions: navigate immediately, no confirm.                                                                                                       |


### Journey C — Analytics Drill

**Goal:** Admin checks performance, switches between analytics tabs, optionally drills into a low-performing article.


| #   | User action                                                      | System response                                                                                                                                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Clicks "Analytics" rail icon                                     | Navigates to `/analytics/article-performance` (default tab). Rail "Analytics" active. Sub-nav: 3 flat items, "Article Views and Engagement" active. Breadcrumb: "Analytics". Content: PageHeader (title + DateRangePill) + StatCardGrid + AnalyticsAreaChart + 2-up (Donut + ArticlesNeedsAttention) + ArticlePerformanceTable. |
| 2   | Clicks "Search" in sub-nav                                       | Navigates to `/analytics/search`. Sub-nav active item swaps. Content swaps: PageHeader + 2-up (search vol + missed search) + SearchKeywordsTable + ContentGapsTable.                                                                                                                                                            |
| 3   | Clicks "AI Answer Performance"                                   | Navigates to `/analytics/ai-answer-performance`. Content swaps to AI metrics + deflection chart + AIConversationLogsCard + MostCitedArticlesTable.                                                                                                                                                                              |
| 4   | Clicks an article row in ArticlePerformanceTable (back on tab 1) | Navigates to that article's editor (`/kb/managing-emails/<slug>/edit`). Rail switches to "Editor" active. Explorer expanded to that article.                                                                                                                                                                                    |
| 5   | Hovers over a chart                                              | Recharts native tooltip appears. (Already wired in the kb-ui components.)                                                                                                                                                                                                                                                       |
| 6   | Clicks DateRangePill                                             | No-op for v1 (see §10 open question).                                                                                                                                                                                                                                                                                           |


---

## 7. Per-Page User Actions

Exhaustive table of every interactive element on every page and its expected outcome.

### 7.1 Persistent shell (all routes except collapsed)


| Element              | Action | Outcome                                      |
| -------------------- | ------ | -------------------------------------------- |
| Rail: Editor icon    | Click  | Navigate to `/kb/managing-emails`            |
| Rail: AI icon        | Click  | Navigate to `/ai-optimise`                   |
| Rail: Analytics icon | Click  | Navigate to `/analytics/article-performance` |
| Rail: Settings icon  | Click  | Navigate to `/settings` (placeholder)        |
| Rail: Logo           | Click  | Navigate to `/` (= category default)         |


### 7.2 Category page (`/kb/:categorySlug`)


| Element                   | Action | Outcome                                                                                |
| ------------------------- | ------ | -------------------------------------------------------------------------------------- |
| Explorer: folder chevron  | Click  | Toggle expand/collapse (local state)                                                   |
| Explorer: folder row      | Click  | Navigate to `/kb/<that-folder-slug>` if a category page exists; else show empty state  |
| Explorer: article row     | Click  | Navigate to `/kb/<categorySlug>/<articleSlug>/edit`                                    |
| Breadcrumb segment        | Click  | Navigate up the tree (e.g., to parent category)                                        |
| PageHeader "+ New" button | Click  | Insert a new draft article at top of ArticlesTable, navigate to its editor immediately |
| SubCategoriesTable row    | Click  | Navigate to that subcategory page                                                      |
| ArticlesTable row         | Click  | Navigate to that article's editor                                                      |
| Article status badge      | Hover  | (Static, no tooltip in v1)                                                             |


### 7.3 Editor page (`/kb/:cat/:art/edit`)


| Element                          | Action                  | Outcome                                                                             |
| -------------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| Breadcrumb home icon             | Click                   | Navigate to category page (with unsaved-changes guard, see §8.4)                    |
| Breadcrumb "Save as draft"       | Click                   | Persist body + settings to mock store, status unchanged. (Disabled when not dirty.) |
| Breadcrumb "Publish"             | Click                   | Persist + flip status to published, navigate to category page                       |
| Breadcrumb "×" close             | Click                   | Same as home icon                                                                   |
| Editor body                      | Type, paste, format     | Tiptap default behavior. Marks dirty.                                               |
| Editor body                      | Select text             | BubbleMenu appears with formatting buttons (built-in to ContentEditor)              |
| Editor body                      | Press `/` at line start | Notion-style slash menu opens (built-in)                                            |
| Settings panel: collapse caret   | Click                   | Collapse/expand panel (local state)                                                 |
| Settings panel: any field        | Edit                    | Update mock store optimistically; mark dirty                                        |
| Settings panel: tag chip ×       | Click                   | Remove tag                                                                          |
| Settings panel: reviewer "+ Add" | Click                   | (No-op for v1 — see §10 open question)                                              |


### 7.4 AI Optimise Hub (`/ai-optimise`)


| Element                             | Action | Outcome                                                                         |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Sub-nav: AI Centre row              | Click  | No-op (or brief inline toast "Coming soon")                                     |
| Sub-nav: AI Optimise row            | Click  | Already active — no-op                                                          |
| SuggestionCard body                 | Click  | Navigate to `/ai-optimise/<that-articleSlug>/review`                            |
| SuggestionCard "📨 N Conversations" | Click  | (V1 recommendation: same as card click. Deferring inline sources sheet on hub.) |


### 7.5 AI Gaps Interactive (`/ai-optimise/:art/review`)

All interactions are reducer-driven; see Journey B for the full mapping.


| Element                                    | Action | Outcome                                                                                                                        |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Breadcrumb home icon                       | Click  | Same as × close                                                                                                                |
| Breadcrumb "×" close                       | Click  | If decisions made: confirm "Discard review?" → reset + navigate to `/ai-optimise`. Else navigate immediately.                  |
| Breadcrumb "Save as draft"                 | Click  | Persist current decisions (per-article) without finalizing publish.                                                            |
| Breadcrumb "Publish"                       | Click  | Apply accepted suggestions to article body, mark suggestions published, article.status → published, navigate to `/ai-optimise` |
| AISuggestionsCard "Review Suggestions (N)" | Click  | dispatch `review`                                                                                                              |
| AISuggestionsCard ▲ / ▼                    | Click  | dispatch `prev` / `next`                                                                                                       |
| AIGapSuggestionCard ✓                      | Click  | dispatch `accept(id)`                                                                                                          |
| AIGapSuggestionCard ×                      | Click  | dispatch `reject(id)`                                                                                                          |
| AIGapSuggestionCard "📄 N Sources"         | Click  | dispatch `openSources(id)`                                                                                                     |
| Accepted/dismissed chip ↶                  | Click  | dispatch `undo(id)`                                                                                                            |
| SourcesSideSheet × button                  | Click  | dispatch `closeSources`                                                                                                        |
| SourcesSideSheet backdrop                  | Click  | dispatch `closeSources`                                                                                                        |
| Keyboard `j` / ArrowDown                   | Press  | `next` (only when reviewing + sheet closed + no input focused)                                                                 |
| Keyboard `k` / ArrowUp                     | Press  | `prev` (same conditions)                                                                                                       |
| Keyboard `y` / Enter                       | Press  | `accept(activeId)` (same conditions)                                                                                           |
| Keyboard `n`                               | Press  | `reject(activeId)` (same conditions)                                                                                           |
| Keyboard `Escape`                          | Press  | `closeSources` (when sheet open)                                                                                               |


### 7.6 Analytics — Article Performance (`/analytics/article-performance`)


| Element                         | Action | Outcome                                        |
| ------------------------------- | ------ | ---------------------------------------------- |
| Sub-nav: Search                 | Click  | Navigate to `/analytics/search`                |
| Sub-nav: AI Answer Performance  | Click  | Navigate to `/analytics/ai-answer-performance` |
| DateRangePill                   | Click  | No-op v1 (open question §10)                   |
| Chart elements                  | Hover  | Recharts native tooltip                        |
| ArticlesNeedsAttentionTable row | Click  | Navigate to that article's editor              |
| ArticlePerformanceTable row     | Click  | Navigate to that article's editor              |


### 7.7 Analytics — Search (`/analytics/search`)


| Element                           | Action | Outcome                                                           |
| --------------------------------- | ------ | ----------------------------------------------------------------- |
| Sub-nav: Article Views, AI Answer | Click  | Navigate to that tab                                              |
| DateRangePill                     | Click  | No-op v1                                                          |
| SearchKeywordsTable row           | Click  | No-op v1 (no destination defined)                                 |
| ContentGapsTable row              | Click  | No-op v1 (in real product → "create article" — out of demo scope) |


### 7.8 Analytics — AI Answer Performance (`/analytics/ai-answer-performance`)


| Element                              | Action | Outcome                           |
| ------------------------------------ | ------ | --------------------------------- |
| Sub-nav: Article Views, Search       | Click  | Navigate to that tab              |
| DateRangePill                        | Click  | No-op v1                          |
| AIConversationLogsCard sort dropdown | Click  | No-op v1 (static list)            |
| AIConversationLogsCard source link   | Click  | No-op v1                          |
| MostCitedArticlesTable row           | Click  | Navigate to that article's editor |


---

## 8. Cross-Cutting Behaviors

### 8.1 Routing engine

React Router v6 data router (`createBrowserRouter`). The shell is a layout route; child routes render into the shell's content slot. Collapsed-shell routes (editor, AI Gaps review) use a sibling layout route that omits rail and sub-nav.

### 8.2 Persistent state across navigation

Lives in a single `MockStore` React context, seeded once on app mount. Survives navigation. Wiped on full page refresh.


| State                             | Read by                                                      | Written by                                     |
| --------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Article store (id → article)      | Category, Editor, AI Optimise hub, AI Gaps, Analytics tables | Editor save/publish, AI Gaps publish, "+ New"  |
| Suggestion store                  | AI Optimise hub, AI Gaps                                     | AI Gaps accept/reject/undo/publish/reset       |
| Per-article AI Gaps reducer state | AI Gaps                                                      | AI Gaps actions (auto-saved on every dispatch) |
| Active section / active article   | Sub-nav highlight                                            | Route changes                                  |


### 8.3 Active state derivation

- Rail active icon: derived from route prefix (see §4.3)
- Explorer active item: derived from current route (categorySlug + articleSlug)
- Sub-nav active item (analytics): derived from analytics tab in route

### 8.4 Unsaved-changes guard


| Page    | Guard                                                                                                                                                          | Trigger                                               |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Editor  | If editor body or settings differ from store snapshot since last save: native `beforeunload` for tab close + custom React Router blocker for in-app navigation | Close ×, home icon, rail icon, browser back           |
| AI Gaps | If any decisions made (state.decisions non-empty) AND user clicks × close: confirm dialog "Discard review?"                                                    | Close × only. Rail clicks during AI Gaps: same guard. |


Saved/published transitions clear the guard automatically.

### 8.5 AI Gaps mid-flow persistence

When the user enters AI Gaps for an article, the reducer state is read from `MockStore.aiGapsStateByArticle[articleId]`. Every dispatch writes back. So a user can review s1 + accept, navigate to Analytics, navigate back, and resume at s2 active. Publishing or close-with-reset clears the entry.

### 8.6 Keyboard shortcuts isolation

Keyboard handlers (j/k/y/n/Escape) attach **only** when the active route is AI Gaps Interactive. They check `document.activeElement` and bail if it is an editable element (input, textarea, contenteditable). Tiptap focus inside ArticleBody uses a `contenteditable=false` wrapper since the body is read-only here.

### 8.7 Save/publish feedback

v1 recommendation: minimal inline toast (single component, top-right, 3s autohide, single message at a time). Alternatives in §10.

### 8.8 Initial load behavior

- Bundle size: aim for <500kb gzip first load (Tiptap and Recharts are heavy — code-split per route if needed at TRD time).
- Initial route: `/` redirects to `/kb/managing-emails`.
- No splash screen, no auth flow. App renders the category page on first paint.

---

## 9. Edge Cases

### 9.1 Editor — typing then navigating

User types one character → unsaved changes guard fires on rail click. Confirmation: "You have unsaved changes. Discard?" → Yes navigates and discards; No stays.

### 9.2 Editor — publishing an already-published article

Status stays `published`. lastUpdatedAt updates. No status badge change on category page (already showing Published). Same toast.

### 9.3 Editor — "+ New" twice without saving the first

The first new article has `id` and `slug` reserved in the store as a draft with empty body. Navigating to a second "+ New" creates another. Both visible in ArticlesTable as drafts. (No autosave warning — these are explicit new-article creations.)

### 9.4 AI Optimise — hub empty after publish

If the demo's only article with pending suggestions is published, the hub shows an empty state: "No suggestions to review." No additional pattern needed; reuse the empty-state pattern from ArticlesTable or a simple centered text block. **Open question §10**: does this need a distinct empty-state component, or is plain centered text acceptable?

### 9.5 AI Gaps — direct URL load with already-published article

User pastes `/ai-optimise/reset-password/review` after the article was already published. Suggestions for that article have status `'published'`, not `'pending'`. The page should render the terminal mode with all 3 chips already accepted/dismissed (whatever they were at publish time). Publish button disabled (already published). Close × goes to hub.

### 9.6 AI Gaps — direct URL load with unknown articleSlug

Article doesn't exist in store → render a minimal 404 inside the shell ("Article not found. Back to AI Optimise"). Same pattern for `/kb/:bad/:bad/edit`.

### 9.7 AI Gaps — sources sheet open during keyboard nav

`j` / `k` / `y` / `n` are disabled while sheet is open. Only Escape works.

### 9.8 AI Gaps — undo after publish

Cannot happen. Publish navigates away. If the user navigates back, suggestions are `'published'` and chips don't render undo (terminal mode only).

### 9.9 Browser back / forward

Native React Router behavior. The unsaved-changes guard fires on back too.

### 9.10 Direct URL load to unknown route

Catch-all route → minimal 404 page with "Back to home" link. No rail/explorer (no shell).

### 9.11 Analytics — drilling into an article that was deleted

Out of scope (no delete action exists in v1).

### 9.12 Resize below 1280

No special handling. The shell measures fixed widths. If viewport < 1280, content overflows — acceptable for a desktop-only demo.

### 9.13 Fast double-click on rail icon

React Router dedupes navigation. No special handling.

---

## 10. Resolved Decisions (locked 2026-04-26)

All open questions resolved per user approval + 3 refinements. Decisions baked into the rest of the PRD; this section is the rationale archive.


| #   | Decision                                  | Resolution                                                                                                                                                                               |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Save/publish feedback                     | **Toast.** Single-instance inline toast, top-right, 3s autohide, success/error variants. Spec in §12.1.                                                                                  |
| 2   | AI Centre sub-nav row                     | **Visible, no-op + "Coming soon" toast on click.** Matches Figma fidelity.                                                                                                               |
| 3   | AI Optimise hub "📨 N Conversations" link | **Same as card click** for v1. Defers inline-sources feature.                                                                                                                            |
| 4   | DateRangePill on analytics                | **No-op v1 + "Coming soon" toast.** No date-picker shipped in kb-ui.                                                                                                                     |
| 5   | Reviewers "+ Add" on settings panel       | **No-op v1 + "Coming soon" toast.** No user-picker shipped.                                                                                                                              |
| 6   | "+ New article" CTA                       | **Create immediately**, placeholder title "Untitled article", empty body, navigate to editor.                                                                                            |
| 7   | Articles with AI suggestions              | **3 distinct articles, each with their own 3-suggestion fixture.** Confirmed. (See §5.1 AISuggestion entity.)                                                                            |
| 8   | AI Optimise empty state                   | **Plain centered text** "No suggestions to review." No new component.                                                                                                                    |
| 9   | Settings page                             | **"Coming soon" placeholder page.** Rail icon stays.                                                                                                                                     |
| 10  | Mock store persistence                    | **In-memory only.** Refresh wipes. Demo determinism over convenience.                                                                                                                    |
| 11  | Tree depth and population                 | **OVERRIDE per refinement #2:** Full deep tree, 5 top-level categories, every node navigable to a populated destination. No empty stubs. (See §5.1 Category entity for full tree shape.) |
| 12  | Editor "Publish" destination              | **Always back to category page** the article belongs to. Predictable.                                                                                                                    |


---

## 11. Acceptance Criteria for Demo Sign-Off

The demo is "done" when ALL of the following are true:

- All 3 journeys (A, B, C) completable end-to-end with zero `console.log` placeholders for primary actions
- Every interactive element in §7 has its specified outcome
- All 9 edge cases in §9 handled (or explicitly deferred with a note)
- All 10 open questions in §10 resolved
- App boots from `vite dev` and renders the category page on first paint
- App builds via `vite build` and the static bundle runs from a plain HTTP server
- All `@test-kb-ui/kb-ui` imports resolve from the published barrel (no deep imports into `src/`)
- No new components built outside `apps/demo/src/` — every visual is composed from `@test-kb-ui/kb-ui` exports
- Typecheck clean across both packages

---

---

## 12. Production-Grade Polish Spec

This section translates §3.4's quality bar into concrete, verifiable requirements. Every item must be implemented unless explicitly deferred during the build.

### 12.1 Toast notification system

- **Single component** lives in `apps/demo/src/components/Toast.tsx`. Mounted once at the shell root.
- **Top-right placement**, fixed, 16px from edges, z-index above SourcesSideSheet.
- **Single-instance**: if a new toast fires while one is showing, the previous is replaced (no stacking).
- **Variants**: `success` (green left border + checkmark icon), `error` (red), `info` (gray).
- **Autohide**: 3s for success/info, 5s for error. Hover pauses timer. Manual dismiss via × button.
- **API**: `useToast()` hook → `{ showToast(message, variant) }`. Imported wherever needed.
- **Triggers** (mandatory):
  - Save draft → `showToast('Draft saved.', 'success')`
  - Publish article → `showToast('Article published.', 'success')`
  - Publish from AI Gaps → `showToast('Suggestions applied and published.', 'success')`
  - Discard new draft → `showToast('Draft discarded.', 'info')`
  - Any "Coming soon" no-op → `showToast('Coming soon.', 'info')`

### 12.2 Focus management on route change

- On every navigation, focus moves to the page's primary `<h1>` (or PageHeader title) with `tabIndex={-1}`.
- Editor route: focus the Tiptap editor body (so user can immediately type).
- AI Gaps Interactive route: focus the "Review Suggestions" button on first entry; once reviewing, focus the active card.
- Modal/dialog (e.g., unsaved-changes confirm): focus trap inside dialog, return focus to trigger on close.

### 12.3 Page transitions

- No flash of unstyled content. App shell renders synchronously with the first route's content.
- Route content swaps with a 150ms cross-fade (CSS `opacity` transition on the content slot only — shell stays static).
- If a route's data is async (it isn't, in v1, but for code-split chunks): show the previous content for up to 200ms while the next chunk loads, then swap.

### 12.4 Keyboard shortcuts (production-grade)

Already specified for AI Gaps (§7.5). Additional global shortcuts:


| Key            | Scope                       | Action                                             |
| -------------- | --------------------------- | -------------------------------------------------- |
| Cmd/Ctrl+S     | Editor route only           | Save draft (preventDefault on browser save dialog) |
| Cmd/Ctrl+Enter | Editor route only           | Publish (if not disabled)                          |
| Esc            | Settings panel open         | Collapse settings panel                            |
| Esc            | Any confirm dialog          | Cancel                                             |
| Esc            | SourcesSideSheet open       | Close sheet                                        |
| `?`            | Any route, no input focused | Open keyboard-shortcuts cheat sheet (overlay)      |


The cheat sheet overlay is a simple modal listing all shortcuts. Same component for the whole app.

### 12.5 Empty states (every place that can be empty)


| Location                                            | Empty state                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Category page with no articles AND no subcategories | Centered illustration-free message: "No content here yet. **Create the first article →**" (CTA = +New) |
| AI Optimise hub with no pending suggestions         | Centered text: "All caught up. No suggestions to review."                                              |
| ArticlesNeedsAttentionTable with no rows            | Inline "No articles need attention right now."                                                         |
| AIConversationLogsCard with no entries              | Inline "No conversations logged yet."                                                                  |
| 404 (route not found)                               | Branded 404 page rendered inside the shell: "Page not found." + "Back to home" link                    |


### 12.6 Bundle and load performance

- **Code-split per route**: each route is a `React.lazy()` import. Initial bundle includes only the shell + category page.
- **Tiptap and Recharts**: lazy-loaded with their respective routes (editor, analytics).
- **Target initial bundle**: <250kb gzip. Total per route on first visit: <500kb gzip.
- **Suspense fallback**: the cross-fade target shows a thin progress bar at the top of the content slot (not a spinner) while a chunk loads.

### 12.7 Accessibility floor

- Tab navigation works on every interactive element in tab order.
- Every icon-only button has `aria-label`.
- Modals/dialogs use Radix primitives (already accessible via kb-ui).
- Color contrast: trust kb-ui (already audited). Demo-specific UI (toast, 404, empty states) must meet WCAG AA.
- No `outline: none` overrides — default focus rings stay visible.

### 12.8 Build discipline

- `vite build` produces a single `dist/` deployable to any static host.
- Source maps enabled for production debugging.
- No environment variables required to run (demo is fully self-contained).
- `apps/demo/README.md` documents: install, dev, build, deploy.

---

## 13. Seed Data Plan

The implementation phase will need this. Captured here so it's not invented ad-hoc.

### 13.1 Category names (final)

Per §5.1 tree. All 5 top-level + 14 mid-level + 4 depth-2 names locked. Subtitles for each PageHeader come from the category description (1 line, ~10 words, real-sounding).

### 13.2 Article title patterns

Articles must sound like real Hiver KB articles. Examples per category:

- **Setting up Hiver:** "Installing the Hiver Chrome extension", "Connecting your first Gmail inbox", "Inviting your first teammate", "Understanding the Hiver dashboard"
- **Shared inboxes — Creating shared inboxes:** "Creating your first shared inbox", "Renaming an existing shared inbox", "How to reset your password" *(AI-targeted)*, "Archiving a shared inbox you no longer use"
- **Rule-based automations:** "Setting up auto-reply rules" *(AI-targeted)*, "Routing emails based on subject keywords", "Tagging conversations automatically", "Triggering Slack notifications from rules", "Conditional rules with multiple criteria"
- **Live chat setup:** "Customizing the chat widget" *(AI-targeted)*, "Connecting Live Chat to your website", "Setting business hours for chat", "Routing chats to specific agents"

(The full 56-article title list is generated at fixture-write time during the build phase. The TRD will define the schema; the ui-engineer dispatch will fill realistic titles per the patterns above.)

### 13.3 Article body content

- Each article: 200–600 words of HTML.
- Structure: opening paragraph (problem framing), at least one `<h2>`, at least one ordered or unordered list, at least one inline link (`<a>`), closing paragraph.
- Tone: matches real KB writing — instructional, second-person ("To enable shared inboxes, navigate to Settings → Inboxes…").
- The 3 AI-targeted articles have ~600-word bodies with `<p data-block-id="b1">…</p>` markers so SuggestionBlock anchors can attach.

### 13.4 AI suggestion content (per the 3 targeted articles)


| Article          | Suggestion 1 (addition)                                     | Suggestion 2 (replace)                                                            | Suggestion 3 (removal)                                     |
| ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Password reset   | Add a "Step 0: Verify identity" block before the first step | Replace "Click 'Forgot password'" with "Click 'Reset password' (renamed in v3.2)" | Remove the deprecated "Reset via SMS" section              |
| Auto-reply rules | Add a note about timezone handling for rule schedules       | Replace ambiguous "Recent" trigger with "Within the last 24 hours"                | Remove the deprecated "Match by sender domain only" toggle |
| Chat widget      | Add an accessibility-best-practices subsection              | Replace "Color picker" with "Theme selector (now WCAG-validated)"                 | Remove the legacy "Embed via iframe" instructions          |


Each suggestion has a `description` field (1–2 sentences explaining the rationale) and a `payload` with the proposed HTML diff.

### 13.5 Conversation sources (per article)

Each AI-targeted article has 4 fictional but realistic customer conversations:

- Real-sounding sender names + emails
- Subject lines that read like support tickets ("Cannot log in after password reset", "Auto-reply not firing on weekends", "Chat widget invisible on mobile Safari")
- Snippets that quote the customer concern (1–2 sentences each)
- Timestamps within the last 30 days

### 13.6 Author distribution

- All 6 users author articles. Distribution roughly even.
- "Current user" (the demo's persona) = Aanya Krishnan. New articles auto-assign her as author.

### 13.7 Analytics fixtures

- Stat-card values: realistic ranges for a mid-size KB (10K–500K monthly views, ~3–8% missed-search rate).
- Chart series: 30 data points per series. Trends visible (e.g., views growing over the period).
- Tables: 5–12 rows each. Article references resolve to real article IDs in the store.

---

*End of PRD v1.1 (refined 2026-04-26). Locked. Proceeding to TRD.*