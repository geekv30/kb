# logs.md — Progress Log

> Compact log — designed to fit in a single Read call (under ~5k tokens). Detailed rationale lives in per-component design docs (`design/*.md`), session learnings live in user memory (`~/.claude/projects/.../memory/`), and PR descriptions are the canonical change record.

## Current Status (2026-05-19)

`@test-kb-ui/kb-ui` v2.0.0 + `@test-kb-ui/kb-mcp` v1.0.0 on npm. Storybook hosted at https://main--69f2245c14966163bdac61ca.chromatic.com/ (Review/* hidden from public). **Live demo:** https://kb-demo-six.vercel.app (production, public; SSO disabled). Tech stack: React 18 + TS strict + Tailwind v4 + Radix + Tiptap + Recharts + `@untitledui/icons` v0.0.22 + tsup + Storybook 10.

**Latest landed (chronological, newest first):**

| Date | Surface | PRs | Notes |
|---|---|---|---|
| 2026-05-18/19 | **Phase 17 — SEO tab on ArticleSettingsPanel** | #108-#121 (12 PRs) | New tab "General/SEO" pill switcher. General trimmed 8→3 fields (Author/Category/Slug, no chevron). New SEO tab w/ Meta title + length verdict meter (Short/Acceptable/Optimal/Long/HardCap, AI quality bump via `aiRefinedAt`), Description + Refine-with-AI affordance + content-aware Skeleton motion, URL field + copy-icon-swap (Copy→Check, no toast), collapsible Advanced canonical URL disclosure, Exclude-from-search Switch + `noindex`/`nofollow` CodeChips, live Google SERP preview that crossfades to "no preview available" when excluded. **New kb-ui primitives:** Tabs · Switch · Skeleton · CodeChip. **New content components:** MetaLengthMeter · SerpPreview · SeoTabBody. **Existing primitives extended:** TextInput.error variant, Textarea.refining/refineSlot/field-sizing autosize, Modal reduced-motion fallback, CompanyLogo.bgColor + CSS border-radius. **Global typography normalized:** labels 13px medium / content 14px regular. **Key diagnostic (PR #121):** user's macOS had Reduce Motion ON → all prior `motion-safe:`-gated keyframes were fully suppressed → user had been seeing none of the polish across chunks 3-11. Per emil "suppress movement, not all motion" — every motion-bearing surface now needs an opacity-only `motion-reduce:` sibling. See [[feedback_reduced_motion_diagnostic]]. |
| 2026-05-17/18 | **emil-design-eng skill install + Phases A-D4 motion audit** | #95-#107 | Skill installed via `npx skills add emilkowalski/skill`. 6-phase motion sweep: A Welcome Tour, B FileExplorerNav, C AI Gaps, D1 Overlays (Modal/SideSheet), D2 Suggestion + Logs cards, D3 Demo (Toast/Progress/EmptyStates), D4 Micro-motion (Button/Rail/Table/Editor/Shell). All `--ease-out-strong` curve + press-scale + asymmetric enter/exit timing. New keyframes in `tokens.css`: `kb-modal-{in,out}`, `kb-sheet-{in,out}`, `kb-backdrop-{in,out}`, `kb-chip-enter`, `kb-suggestion-mount`, `kb-dropdown-in`. See [[project_kb_emil_design_eng_skill]]. |
| 2026-05-16/17 | Editor restyle (Intercom-style) + required article titles + Welcome Tour v10 (no-dim) | 5b1fcd7 + tour commits | Editor on slate-50 page bg w/ single white card (ContentEditor's own chrome — caught nested-card bug: [[feedback_check_existing_component_chrome]]). New ContentEditor `header` slot (kb-ui composition API addition) drives demo's new `ArticleTitleInput` (autosize 36/44 textarea, empty default, publish gated on non-empty + native `title=` tooltip). `editor/setTitle` reducer action; `formatArticleTitle()` read-side `'Untitled'` fallback. Welcome Tour dim removed, sky-500 ring + clamped beacon + infinite sparkle shimmer. See [[project_kb_required_article_titles]], [[project_kb_editor_intercom_style]], [[project_kb_welcome_tour]]. |
| 2026-05-15 | Welcome Tour prototype (demo-only) | #79-#82 | 3-step coach-mark re-onboarding tour (KB → AI Optimise → Analytics → CompletionCard). `/welcome` force-starts. 9 design iterations. Vercel deploy from REPO ROOT (two-project gotcha). |
| 2026-05-14 | Phase 16 — category authoring entry points | #67, #72-#75 | `Textarea` primitive, `NewCategoryModal` pattern (create+edit modes), `Modal.radius/bodyPadding/footerLayout` extensions, `FileExplorerNav.renderRowAction` slot, demo's `+ New` Folder/Article dropdown + per-row 3-dot menu, demo-only template-gallery empty state. |
| 2026-05-12 | Icons: Remix → `@untitledui/icons` (complete swap) | #66 | ~70 distinct icons mapped 1:1, 6 chunks. Storybook agentation overlay + sidebar collapse + `Modal` primitive canonical refactor (also #68, #70, #71). Vercel deploy + Deployment Protection PATCH for shareable per-deploy URLs. See [[project_kb_icons_untitledui_swap]], [[project_kb_vercel_deploy]]. |
| 2026-05-15 | AI Gaps interaction refactor — Y-paired rail | #83-#87 + #88-#94 | 5-chunk refactor: all suggestion cards visible from page-load, paired-Y to article highlights, click-activate, custom rAF smooth scroll, position indicator + remaining counter + terminal state. 7 follow-up fixes (sticky/idle-actions, summary chrome, vanishing-cards, collapsed-chip, article-rail spacing, three-article bodies, bullet highlight artifacts). |
| 2026-05-11 | Demo refresh D1-D4 + foundations consolidation | #53-#64 | Token sweep + ContentEditor CSS tokenize + dark-theme removal (kb-ui is light-only). Demo's editor/AI Gaps/Analytics surfaces migrated onto v2.0.0 composition APIs + Phase 15 review fixes. |
| 2026-05-06-11 | **Phase 15 — pixel-perfect review pass** | #38-#52 | `_review/FigmaCompare` canvas + `figma-sync` REST script. 40+ Review stories wired across 25 components. ~30 drift fixes shipped. New `Field` primitive (label/tooltip/hint/hintEnd composition). New `CursorClickIcon`. New AIConversationLogEntry tail variant `search-result-clicked`. New `AIConversationLogsCard.header` slot. See [[project_kb_pixel_review_pass]]. |
| 2026-04-30 | Phase 13 + 14 — extensibility refactor (v2.0.0) + Storybook polish | #32-#37 | All 36 components extensibility-refactored to composition APIs. **Breaking:** `KBBreadcrumbBar.actions` slot. Every Storybook story rewritten as interactive `Playground` w/ realistic data. See [[project_kb_ui_extensibility_refactor]]. |
| 2026-04-29 | Phase 8/9 publish + Chromatic + kb-mcp product context | #14-#31 | npm publish of `@test-kb-ui/kb-ui` + `@test-kb-ui/kb-mcp` (Phase 8.6 + 9.6). 12 GitHub issues + scope rename `@hiver` → `@test-kb-ui`. Chromatic hosted Storybook on push + PR. kb-mcp gained product-context surface (`kb://product/overview` + `get_product_context`). |
| 2026-04-26 | Phase 7.5 — demo app | (pre-tracking) | `apps/demo/` Vite + React 18 + RR v6 + TS strict + Tailwind v4 SPA consuming `@test-kb-ui/kb-ui` via npm workspace. 9 ui-engineer dispatches covering MockStore + 17 articles + 23 categories + 9 suggestions + 12 conversation sources + all 3 PRD journeys + production polish. Sign-off harness `phase-7-5-9-signoff.mjs` reports 56/56 PASS. |
| 2026-04-21 | Phase 5 + Phase 6 (Editor + AI Gaps) | (pre-tracking) | ContentEditor (Tiptap 3 + StarterKit + Link/Image/Code/Table/Highlight + slash menu + bubble menu), ArticleSettingsPanel (8 fields, all collapsible), KBEditorPage pattern. AI Gaps full review surface: AISubNav, SuggestionCard, AISuggestionsCard, AIGapSuggestionCard, SuggestionBlock, ArticleBody, SourcesSideSheet, KB AI Optimise Hub + AI Gaps Experience patterns (10-frame review loop). |
| 2026-04-16-20 | Phases 0-4 + foundations + pixel polish | (pre-tracking) | Repo scaffold (tsup + Tailwind v4 + Storybook 8), tokens.css + @theme, primitives (Button/Badge/Avatar/TextInput/Dropdown/Divider) + nav atoms (SideNavRail/FileExplorerNav/Breadcrumb/Table/PageHeader), Shell + KBBreadcrumbBar, ArticlesTable. 9-pass Figma diff against 1958:33209 + invariants doc. |

## What's Next

Nothing in flight. **Backlog (no PR yet):**
1. **Reduced-motion fallback sweep** — every existing `motion-safe:`-gated keyframe needs an opacity-only `motion-reduce:` sibling (Modal was fixed in #121; the rest are still bare). Audit + PR queued via [[feedback_reduced_motion_diagnostic]].
2. **Phase 15 unwired components** (need user to provide Figma URLs): `Card` primitive, `AICard`, `ArticleBody` (own review story), `NavArrow`, `StatCard`, `StatCardGrid`, `DateRangePill`, `EditorBreadcrumbActions`.
3. **Considerations** the user might revisit:
   - Whether `@test-kb-ui` scope is permanent or to migrate to `@hiver` once claimable
   - Promote `Tabs` / `Switch` / `Skeleton` Review stories with FigmaCompare canvas (currently only Playground stories exist)
   - Add `body-xs-medium` 13px / `body-sm-regular` 14px tokens to formalize the global label/content typography (currently raw inline)
   - Punted: animating Textarea height on autosize (perf rule against animating `height`)

## Open product decisions

**Phase 6 AI Gaps** (documented in `design/ai-gaps.md` §Open items): navigation onto decided suggestions, keyboard y/n overwrite-on-decided, terminal mode chip visibility, AI icon glyph in production. **Phase 5 Editor carryover:** `Save as draft` text color drift, `Last updated N months ago` subtitle slot, three known Untitled UI icon gaps (`List` for ordered+unordered, blockquote uses `MessageTextSquare02`, H3 uses `HeadingSquare`).

## Key docs

- `plan.md` — build phases table + tech stack + component inventory
- `design.md` — design tokens, Figma node IDs by phase, per-component specs
- `design/ai-gaps.md` — Phase 6 canonical spec (AI Optimise hub + AI review pattern + sources sheet + state machine)
- `design/_layout-invariants.md` — shell-grid cross-component contract
- `design/_tokens.md` — live Figma token tables
- `design/_diff-report.md` — full Figma-vs-Storybook audit + fix log
- `design/editor.md` — ContentEditor decisions + slash menu UX
- `design/article-settings-panel.md` — Settings panel spec
- `design/table.md` — DataTable canonical spec
- `ai-suggestions-flow.md` (repo root) — 10-frame narrative spec of the AI review loop
- `demo-app-prd.md` + `demo-app-trd.md` — demo app product + technical contract
- User memory at `~/.claude/projects/-Users-varunkelkar-Desktop-ai-kb/memory/` — session learnings, codified feedback rules, project context (read MEMORY.md first; it's loaded into context automatically)
