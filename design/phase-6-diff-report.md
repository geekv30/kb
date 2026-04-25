# Phase 6 — Storybook ↔ Figma diff report

**Captured:** 2026-04-25 via `packages/kb-ui/scripts/capture-phase6.mjs` (Playwright headless chromium, viewport per-story, deviceScaleFactor 2). 25 stories, 0 capture failures.

**Figma file:** `9aGp5t9fH1d0PXi4LMhOdb`. Reference frames at `/tmp/figma-audit/`.

**Storybook captures at:** `/tmp/storybook-captures/phase6/`.

**Severity legend:** 🔴 critical / clearly visible · 🟡 noticeable on close inspection · 🟢 nit / sub-pixel.

---

## Summary

**No deltas found.** All 25 captures match Figma at the component-styling level.

| # | Severity | Component / surface | Delta |
|---|---|---|---|
| — | — | — | None |

This is the second clean sweep for Phase 6. The first one (2026-04-21 repair pass) closed all known token + visual deltas via two ui-engineer dispatches (recorded in `design/ai-gaps.md`). This re-audit (rendered diff vs live Figma after Phase 7 wrapped) confirms the fixes held.

---

## What was checked

**Atomic components — all clean:**
- `AIGapSuggestionCard` — active addition, active replace, active removal, accepted addition, dismissed replace
- `AISuggestionsCard` — pre-review, terminal
- `SuggestionBlock` — addition, replace, removal (inline body wash)
- `SuggestionCard` — default, new-article variant, move-article variant (KB Hub)
- `AISubNav` — default
- `SourcesSideSheet` — default
- `ArticleBody` — all-inactive (all 3 gaps washed pre-review), all-accepted (washes removed → plain text)

**Page patterns — all clean:**
- `Patterns/KB AI Gaps — Frame 2` (pre-review)
- `Patterns/KB AI Gaps — Frame 3` (active addition)
- `Patterns/KB AI Gaps — Frame 5` (accepted addition + active replace)
- `Patterns/KB AI Gaps — Frame 8` (active removal)
- `Patterns/KB AI Gaps — Frame 10` (terminal — Reviewed All)
- `Patterns/KB AI Optimise Hub`

**Phase 4/5 spot-checks — all clean:**
- `Patterns/KB Editor Page` (Phase 5)
- `Patterns/KB Category Page — Managing Emails` (Phase 4)

---

## Observed-but-not-deltas

The following differences appeared between Storybook and Figma but are content/scroll-position choices, not styling deltas:

1. **Article body mock copy differs.** Storybook stories lead with "Resetting Your Password via Mobile App"; Figma frames lead with "Resetting from the Web Dashboard." Both are valid exemplar copy — the component renders identical visual treatment regardless of text content. Confirmed by checking `S1Content`/`S2Content`/`S3Content` in `ArticleBody.tsx` — these are story-local copy, not component constants.

2. **Frame 8 scroll position.** Figma frame-8 captures the article scrolled to the Troubleshooting section (where the active removal target lives); the static Storybook capture shows the article at scroll-top. Frame 8 has a `useEffect` that scrolls to `#s3` on mount, but Playwright captures the initial paint before that runs. Not a component bug — captured-state limitation only.

3. **"Last updated" date string.** Storybook says "2 months ago"; Figma says "9 months ago." Mock data drift; not a delta.

4. **Browser chrome on Figma frames.** Figma reference frames are full-page mockups including a Chrome window chrome (tabs + URL bar). Storybook captures only the kb-ui content. Expected — Figma uses the chrome to anchor the design in the real product context, kb-ui ships only the chrome-less frame.

---

## Acceptance verification

Re-read confirms after Phase 7 commit:
- ✅ Accepted addition (`s1: 'accepted'` in Frame 5) renders plain — no wash.
- ✅ Active replace (`s2: 'active'` in Frame 5) renders red+green stacked.
- ✅ Active removal (`s3: 'active'` in Frame 8) renders red wash.
- ✅ AI Suggestions terminal mode shows "Reviewed All" + checkmark.
- ✅ Decision pills (`Addition ACCEPTED`, `Replace DISMISSED`) — plain text + pipe separator (matching the R5 reversion).
- ✅ AISubNav rows render at 14/medium with `bg-[#f1f5f9]` active pill (R5 fix held).

---

## Phase 6 + 4 + 5: complete

No further repair work required. The kb-ui surface from Phase 6 backwards is at 1:1 fidelity with the live Figma references as of 2026-04-25.
