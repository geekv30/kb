# kb-ui extensibility audit (Phase 13.1)

**Date:** 2026-04-29
**Scope:** all components in `packages/kb-ui/src/components/` plus the `useAIGapsReducer` hook.
**Trigger:** SEO panel reproduction (see `project_kb_ui_extensibility_refactor.md` memory).
**Output:** this doc, no code changes.

## Summary

- Total components: 36
- Extensible: 16
- Partial: 9
- Monolithic: 11
- P0 priority refactors: `ArticleSettingsPanel`, `AISuggestionsCard`, `AIGapSuggestionCard`, `AIConversationLogEntry`, `SuggestionCard`
- P1 priority refactors: `KBBreadcrumbBar`, `PageHeader`, `ContentEditor`, `DateRangePill`, `SourcesSideSheet`, `StatCardGrid`

The user's hypothesis is **confirmed**. About 31 percent of components (11/36) are fully monolithic — they bake business labels, field lists, decision pills, kind-chip vocabularies, or specific row schemas directly into source. Another 25 percent (9/36) are partial — they accept some content via slots but still hardcode a layout-defining slice (e.g. `PageHeader` hardcodes the "+ New" CTA; `KBBreadcrumbBar` hardcodes Save/Publish/Close; `AIConversationLogsCard` accepts entries via children but bakes the Sort/Ticket-Created toolbar). The most painful blockers — `ArticleSettingsPanel`, `AIGapSuggestionCard`, `AISuggestionsCard`, `AIConversationLogEntry`, `SuggestionCard` — all live on flagship surfaces a PRD is most likely to ask Claude to extend (settings, AI review, analytics drilldowns), which matches the SEO-panel reproduction story exactly. Primitives (`Button`, `Avatar`, `Badge`, `Card`, `TextInput`, `Divider`, `Breadcrumb`) are already healthy and need no work.

## Component table

### Primitives

| Component | Shape today | Verdict | Recommended API | Likelihood | Priority | BC risk |
|---|---|---|---|---|---|---|
| `Button` (`primitives/Button.tsx`) | `variant`/`icon`/`children` + native `<button>` attrs; no hardcoded labels. | Extensible | No change needed. Optional: add `loading?: boolean` if/when needed. | Low | P3 | None |
| `Avatar` (`primitives/Avatar.tsx`) | `initials`/`name`/`showStatus`/`ariaLabel`; renders text node only — no image src. | Partial | Add `src?: string \| undefined` to render `<img>` when provided; keep initials fallback. | Low | P3 | None |
| `Badge` (`primitives/Badge.tsx`) | 3 fixed `variant` styles + `icon`/`children`. Variant set is closed. | Extensible | No change needed. Reserve `className` for caller overrides (already supported). | Low | P3 | None |
| `Card` (`primitives/Card.tsx`) | `padding`/`as`/forwardRef + `children` + native attrs. Pure chrome. | Extensible | No change needed. | Low | P3 | None |
| `TextInput` (`primitives/TextInput.tsx`) | `prefix`/`suffix`/`charCount` slots + native input attrs. | Extensible | No change needed. | Low | P3 | None |
| `Dropdown` (`primitives/Dropdown.tsx`) | Wraps `TextInput` with a label and trailing chevron — no menu. | Partial | Add `options?: { value: string; label: string }[]` + `onSelect` (Radix-backed) when a real menu is needed; today it's just a styled trigger. | Medium | P2 | None (additive) |
| `Divider` (`primitives/Divider.tsx`) | `subtle` flag only. | Extensible | No change needed. | Low | P3 | None |
| `Breadcrumb` (`primitives/Breadcrumb.tsx`) | `items: BreadcrumbItem[]` driven, leading home glyph baked in. | Partial | Add `homeIcon?: ReactNode` + `separator?: ReactNode` to override the slash and home glyph. | Low | P3 | Low (additive) |

### Brand

| Component | Shape today | Verdict | Recommended API | Likelihood | Priority | BC risk |
|---|---|---|---|---|---|---|
| `AiIcon` (`brand/AiIcon.tsx`) | SVG icon, accepts standard SVG props + `size`. | Extensible | No change needed. | Low | P3 | None |
| `CompanyLogo` (`brand/CompanyLogo.tsx`) | Hiver glyph baked in (svg path); no `src` prop. | Monolithic | Accept `src?: string` (fallback to baked Hiver glyph) and/or `glyph?: ReactNode` slot for the inner mark. | Low | P3 | None (additive) |

### Molecules

| Component | Shape today | Verdict | Recommended API | Likelihood | Priority | BC risk |
|---|---|---|---|---|---|---|
| `PageHeader` (`content/PageHeader.tsx`) | `title`/`subtitle`/`icon`/`rightSlot`/`showCta`; "+ New" CTA hardcoded with `RiAddLine` and label `"New article"` (`PageHeader.tsx:107-117`). | Partial | Replace `showCta`+`onNewClick`+`newButtonLabel` with `cta?: ReactNode` slot — caller provides the button. Keep current props as a deprecated convenience or remove on a major version. | High | P1 | Low (consumers using `onNewClick` need migration) |
| `StatCard` (`content/StatCard.tsx`) | `label`/`value`/`trendDelta`/`trendDirection`. Pure data-driven. | Extensible | No change needed. | Medium | P3 | None |
| `StatCardGrid` (`content/StatCardGrid.tsx`) | `title`/`infoTooltip`/`stats: StatCardProps[]`; info icon and divider hardcoded in JSX. | Partial | Add `headerRight?: ReactNode` slot (e.g. for an action menu / "View all" link) and `renderStat?: (s) => ReactNode` for callers that need richer stat tiles. | Medium | P1 | None (additive) |
| `HelpfulnessTag` (`content/HelpfulnessTag.tsx`) | `value`/`variant` (up/down) only. | Extensible | No change needed; closed variant set. | Low | P3 | None |
| `DateRangePill` (`content/DateRangePill.tsx`) | `value: '7d' \| '30d' \| '90d' \| 'custom'`. Presets `'Last 7 days' / 'Last 30 days' / 'Last 90 days'` and `'Custom...'` row hardcoded inline (`DateRangePill.tsx:36-40`, `DateRangePill.tsx:78-100`). | Monolithic | `presets?: { value: string; label: string }[]`, `customLabel?: string`, `onSelect?: (value)`; keep current presets as defaults. | Medium | P1 | Low |
| `NavArrow` (`content/NavArrow.tsx`) | `direction`/`onClick`. | Extensible | No change needed. | Low | P3 | None |
| `AICard` (`content/AICard.tsx`) | `mode`/`header`/`body`/`footer`/`children` slots. Pure chrome. | Extensible | No change needed — already the model. | Low | P3 | None |
| `SuggestionBlock` (`content/SuggestionBlock.tsx`) | `type`/`children`/`oldContent`/`newContent`/`id`. | Extensible | No change needed. | Low | P3 | None |
| `SlashCommandMenu` (`content/SlashCommandMenu.tsx`) | `items`/`onSelect`/`activeIndex`. List source is the SLASH_COMMANDS constant in the same file but the menu reads only `items`. | Extensible | The MENU itself is fine. The companion `SLASH_COMMANDS` array is fixed — see "Open questions" below for whether the slash registry should be extension-host-style. | Medium | P2 | Low |
| `TagChip` / `AddChipButton` (inside `ArticleSettingsPanel.tsx`) | Private; not exported. | Monolithic (locked-in private) | Lift to `primitives/TagChip.tsx` so other surfaces can reuse and so the panel doesn't have to re-declare them. Pure refactor. | Medium | P2 | None |

### Organisms

| Component | Shape today | Verdict | Recommended API | Likelihood | Priority | BC risk |
|---|---|---|---|---|---|---|
| `ArticleSettingsPanel` (`content/ArticleSettingsPanel.tsx`) | 8 hardcoded fields (Author, Category, Slug, Tags, PublishDate, SeoTitle, Visibility, Reviewers) wired into a fixed render order (`ArticleSettingsPanel.tsx:528-554`). All field labels, max-lengths (`SLUG_MAX=32`, `SEO_MAX=60`), placeholder copy ("Select author", "Pick a date", "+ Add", "New tag", "New User") baked in. No `children` / `sections` / `items` prop. | Monolithic | `sections?: ArticleSettingsSection[]` (or `fields?`) where each section/field carries its own `id`, `label`, and rendered control. Provide a default array equal to today's 8 sections so existing call sites don't break. Optional `headerSlot` + `footerSlot`. | High | **P0** | Low if defaults preserved; High if defaults removed |
| `AIGapSuggestionCard` (`content/AIGapSuggestionCard.tsx`) | Renders 3 fixed types via `TYPE_META` (`AIGapSuggestionCard.tsx:45-52` — addition / replace / removal). Active card slot order Title→Description→Sources→Reject→Accept hardcoded (`AIGapSuggestionCard.tsx:179-211`). Decision-chip labels `"ACCEPTED" / "DISMISSED"` hardcoded (`:140`). | Monolithic | `actions?: ReactNode` (replaces hardcoded reject/accept), `meta?: ReactNode` (replaces hardcoded sources link), `decisionLabels?: { accepted: string; dismissed: string }`, `types?: Record<string, TypeMeta>` so callers can register new suggestion kinds. | High | **P0** | High (call sites depend on current actions) |
| `AISuggestionsCard` (`content/AISuggestionsCard.tsx`) | Modes `pre-review` / `terminal`; titles "AI Suggestions" / "Suggestions" hardcoded (`AISuggestionsCard.tsx:50`); CTA label `Review Suggestions (N)` and `Reviewed All` hardcoded (`:91`, `:104`). | Monolithic | Add `title?: string`, `cta?: ReactNode` (active mode), `terminalLabel?: string` (or render-prop). Fall back to today's strings as defaults. | High | **P0** | Low (additive with defaults) |
| `AIConversationLogEntry` (`content/AIConversationLogEntry.tsx`) | Row schema fixed: question → answer → sources → optional follow-up → tail; tail variants `ticket-created` / `source-clicked` hardcoded with copy `"Ticket created by ..."` / `"Source clicked by ..."` (`AIConversationLogEntry.tsx:177-228`). | Monolithic | `tail?: { kind: string; render: (actor) => ReactNode }` registry, OR replace `tail` discriminated union with `tail?: ReactNode` slot; expose `rows?: ReactNode[]` for callers wanting non-default row sequences. | High | **P0** | High (hardcoded tail strings used by analytics demo data) |
| `SuggestionCard` (`content/SuggestionCard.tsx`) | `kind: 'article-edit' \| 'new-article' \| 'move-article'` is a closed set; per-kind labels and pink-tinted Remix glyphs are hardcoded inline (`SuggestionCard.tsx:67-100`). Meta row sequence `kind · conversations · impact` hardcoded. | Monolithic | `kind` becomes string with `kindRegistry?: Record<string, { label: string; icon: ReactNode }>`; `meta?: ReactNode` slot replaces fixed conversations/impact pair. Keep the 3 default kinds. | High | **P0** | Low if defaults retained |
| `ArticleBody` (`content/ArticleBody.tsx`) | Already takes `regions: ArticleBodyRegions` slots and `decisions`. The decision-to-render rules are fixed (`s1`/`s2`/`s3` slot ids), but copy is consumer-supplied. | Extensible | No change needed — this was refactored already (see top-of-file comment). | Medium | P3 | None |
| `ContentEditor` (`content/ContentEditor.tsx`) | Tiptap extensions list, toolbar items, slash registry, scoped CSS all locked into the file (`ContentEditor.tsx:461-504`). Toolbar order hardcoded (`:342-446`). | Partial | Hoist `extensions: Extension[]` and `toolbarItems?: ToolbarItemDef[]` to props. Use a `useEditorBehaviour` headless hook (à la `useAIGapsReducer`) for state + commands so consumers can build their own toolbar over the same editor. Keep current defaults. | High | P1 | Low (additive); depends on whether current `EditorContent` JSX is hidden behind a slot |
| `DataTable` (`content/DataTable.tsx`) | `columns: DataTableColumn<T>[]`, `rows`, `heading: ReactNode`. Composition-friendly. | Extensible | No change needed. | High | P3 | None |
| `AnalyticsChartCard` (`content/AnalyticsChartCard.tsx`) | `title`/`infoTooltip`/`subtitle`/`headerRight`/`children`. | Extensible | No change needed. | Medium | P3 | None |
| `AIConversationLogsCard` (`content/AIConversationLogsCard.tsx`) | Accepts entries via `children`. Sort/Ticket-Created toolbar hardcoded into JSX (`AIConversationLogsCard.tsx:144-168`); only sort options are slotted. The `Ticket Created` label is baked inline (`:165`). | Partial | Replace the hardcoded toolbar with `toolbar?: ReactNode` (or a structured `filters?: FilterDef[]`). Keep `sortOptions` / `ticketCreatedFilter` as a default-toolbar shorthand. | Medium | P2 | Low |
| `SourcesSideSheet` (`overlays/SourcesSideSheet.tsx`) | Shape `ConversationSource` is a fixed interface with `senderName`/`senderEmail`/`subject`/`snippet`/`timestamp`. The card layout (mail icon, sender, timestamp, subject, snippet) is hardcoded (`SourcesSideSheet.tsx:47-105`). Header label `"Sources"` baked. | Monolithic | Replace `sources: ConversationSource[]` with `items: ReactNode[]` (consumer-rendered), plus `title?: string` and `count?: number`. Optional helper component `<SourcesSideSheet.MailItem source={...} />` preserves the current card style as a convenience. | Medium | P1 | High (callers pass typed sources today) |

### Page shell

| Component | Shape today | Verdict | Recommended API | Likelihood | Priority | BC risk |
|---|---|---|---|---|---|---|
| `AppShell` (`shell/AppShell.tsx`) | Pure slot-driven (`rail` / `explorer` / `breadcrumb` / `children`). Background hardcoded `#f5f5f5` and `bg-white` on the content column. | Extensible | No change needed; consider exposing `contentClassName` if a new app needs different background. | Low | P3 | None |
| `KBBreadcrumbBar` (`shell/KBBreadcrumbBar.tsx`) | `items` slot but `editor` variant hardcodes `Save as draft`/`Publish`/`Close` actions (`KBBreadcrumbBar.tsx:163-208`). Labels and disabled-state semantics baked. Save text falls back to `publishDisabled` (`:87-88`). | Partial | Replace baked editor actions with `actions?: ReactNode` (or `primaryAction`/`secondaryAction`/`closeAction` named slots). Keep current props as a deprecated `EditorActions` named export. | High | P1 | High (every editor page wires `onSaveAsDraft` / `onPublish` today) |
| `SideNavRail` (`nav/SideNavRail.tsx`) | `items: NavRailItem[]` + `brandLogo` + `bottomSlot`. | Extensible | No change needed. | Low | P3 | None |
| `FileExplorerNav` (`nav/FileExplorerNav.tsx`) | `items: NavItem[]` + `headerIcon` + `variant`. Folder/article rendering is hardcoded — caller cannot supply a custom row renderer. Status colours `published=#42cd83` / `draft=#898989` baked. | Partial | Add `renderItem?: (item, depth) => ReactNode` for surfaces that need custom row content (e.g. an "AI suggestion count" badge). Keep current default renderer. | Medium | P2 | None (additive) |

### Charts

| Component | Shape today | Verdict | Recommended API | Likelihood | Priority | BC risk |
|---|---|---|---|---|---|---|
| `AnalyticsAreaChart` (`content/AnalyticsAreaChart.tsx`) | `data`/`xKey`/`series` (1 or 2)/`goalLine`/`yTicks`. Series variants closed to `views` / `unique` / `positive` (`AnalyticsAreaChart.tsx:28`, `:66-70`). | Partial | Open `AreaSeriesKey` to a string + `seriesPalette?: Record<string,string>`. Today every new colour requires editing the file. | Medium | P2 | Low |
| `AnalyticsDonutChart` (`content/AnalyticsDonutChart.tsx`) | `data: DonutDatum[]` (each entry can specify color); palette rotates donut-1..6. Already extensible. | Extensible | No change needed. | Medium | P3 | None |

## Headless behavior callouts

- `useAIGapsReducer` (`hooks/useAIGapsReducer.ts`) — already separates a pure reducer (`aiGapsReducer`) and helper selectors (`isPublishEnabled`, `isAllReviewed`) from any chrome. **Positive example.** This is the model for Phase 13.2.
- `ContentEditor` should grow a sibling `useContentEditor()` hook that returns the Tiptap `editor` instance plus typed command handles. The current monolithic component bundles state + chrome + scoped CSS — splitting it lets non-default toolbars share the same editor instance without forking.
- `ArticleSettingsPanel` could ship a sibling `useArticleSettings()` hook that owns the controlled/uncontrolled mirror logic (currently inline at `ArticleSettingsPanel.tsx:457-476`). Consumers building custom field sets would import the reducer pattern, not the panel.
- `AnalyticsChartCard` is already pure chrome — no headless hook needed.

## Per-component refactor sketches (P0 + P1 only)

### ArticleSettingsPanel (P0)

- Current: 8 hardcoded `<XField>` calls with fixed labels and placeholders.
- Proposed:
  ```ts
  type ArticleSettingsSection = {
    id: string;
    label: string;
    /** Caller-rendered control. Use the existing FieldBox/Label atoms (export them) for visual cohesion. */
    content: ReactNode;
  };
  type ArticleSettingsPanelProps = {
    sections?: ArticleSettingsSection[]; // default = the 8 KB sections, kept for BC
    headerSlot?: ReactNode; // top-right (e.g. an action menu)
    footerSlot?: ReactNode;
    defaultCollapsed?: boolean;
    compact?: boolean;
    className?: string;
  };
  ```
- Notes: export `FieldBox`, `FieldLabel`, `TagChip`, `Placeholder` so consumers compose visually-correct controls. Keep the 8 default sections as a named export (`DEFAULT_ARTICLE_SETTINGS_SECTIONS`) so the demo doesn't break.

### AIGapSuggestionCard (P0)

- Current: hardcoded `TypeChip` set (addition/replace/removal), hardcoded reject + accept buttons, `SourcesButton`, `"ACCEPTED"/"DISMISSED"` labels.
- Proposed:
  ```ts
  type AIGapSuggestionCardProps = {
    suggestion: AISuggestion;
    state: AISuggestionState;
    typeRegistry?: Record<string, { label: string; color: string; icon: ReactNode }>;
    actions?: ReactNode; // replaces reject/accept + sources
    meta?: ReactNode; // optional badge row above title
    decisionLabels?: { accepted: string; dismissed: string };
    onUndo?: (id: string) => void;
    className?: string;
  };
  ```
- Notes: ship a `<DefaultGapActions />` helper that renders today's reject/accept/sources triplet so existing call sites can opt in by passing it.

### AISuggestionsCard (P0)

- Current: titles `"AI Suggestions"` / `"Suggestions"`, CTA `Review Suggestions (N)`, terminal label `Reviewed All`.
- Proposed:
  ```ts
  type AISuggestionsCardProps = {
    mode: 'pre-review' | 'terminal';
    count: number;
    summary: string;
    title?: string; // default by mode
    cta?: ReactNode; // active CTA — defaults to today's `Review Suggestions (N)`
    terminalLabel?: string; // default "Reviewed All"
    onPrev?: () => void;
    onNext?: () => void;
    className?: string;
  };
  ```

### AIConversationLogEntry (P0)

- Current: closed `AIConversationTail` discriminated union with hardcoded copy `"Ticket created by ..."` / `"Source clicked by ..."`.
- Proposed:
  ```ts
  type AIConversationTail = {
    icon?: ReactNode;
    content: ReactNode;
  };
  type AIConversationLogEntryProps = {
    question: string;
    timestamp: string;
    feedback: AIConversationFeedback;
    answer: string | null;
    answerDisabled?: boolean;
    sourceCount: number;
    sources?: ConversationSource[];
    followUp?: AIConversationFollowUp;
    tail?: AIConversationTail;
    extraRows?: ReactNode[]; // additional rows after sources (consumer-rendered with shared `Row` atom)
    showViewAll?: boolean;
    onViewAll?: () => void;
    className?: string;
  };
  ```
- Notes: export the `Row` atom so consumers can author rows that match the dotted-connector left rail. Provide `<TailRow.TicketCreated actor="..." />` and `<TailRow.SourceClicked actor="..." />` helpers for legacy data.

### SuggestionCard (P0)

- Current: closed kind set `'article-edit' | 'new-article' | 'move-article'`, hardcoded pink-tinted Remix glyphs and labels per kind.
- Proposed:
  ```ts
  type SuggestionKindMeta = { label: string; icon: ReactNode };
  type SuggestionCardProps = {
    title: string;
    description: string;
    kind: string; // free-form id
    kindRegistry?: Record<string, SuggestionKindMeta>; // default = today's 3 kinds
    icon?: ReactNode;
    meta?: ReactNode; // replaces conversations/impact pair
    onClick?: () => void;
    className?: string;
  };
  ```
- Notes: keep `conversationCount`/`impact` props as a default-meta shorthand (renders today's `· N Conversations · HIGH IMPACT`).

### KBBreadcrumbBar (P1)

- Current: `editor` variant hardcodes Save/Publish/Close with their disabled-state lockstep behaviour.
- Proposed:
  ```ts
  type KBBreadcrumbBarProps = {
    items: KBBreadcrumbItem[];
    sidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    actions?: ReactNode; // replaces variant=editor's hardcoded buttons
    className?: string;
  };
  ```
- Notes: ship `<EditorBreadcrumbActions onSaveAsDraft={...} onPublish={...} onClose={...} />` as a separate export to preserve today's behaviour without forking. Drop the `variant` prop entirely (variants become "did the caller pass actions?").

### PageHeader (P1)

- Current: hardcoded `+ New article` button (`PageHeader.tsx:107-117`).
- Proposed:
  ```ts
  type PageHeaderProps = {
    size?: 'md' | 'lg';
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    actions?: ReactNode; // replaces rightSlot + showCta + onNewClick + newButtonLabel
    className?: string;
  };
  ```
- Notes: keep `rightSlot` as a deprecated alias for `actions` for one minor version. The `+ New article` default disappears — every page that uses `size='md'` must explicitly opt in.

### ContentEditor (P1)

- Current: Tiptap extensions list and bubble-menu toolbar hardcoded inside the component.
- Proposed:
  ```ts
  type ContentEditorProps = {
    initialContent?: string | object;
    onChange?: (html, json) => void;
    onSave?: (html, json) => void;
    placeholder?: string;
    readOnly?: boolean;
    extensions?: Extension[]; // default = today's set
    toolbar?: (editor: Editor) => ReactNode; // default = today's BubbleMenu toolbar
    slashCommands?: SlashCommand[]; // default = today's SLASH_COMMANDS
    className?: string;
  };
  ```
- Notes: also export `useContentEditor()` returning `{ editor, html, json }` so consumers can build wholly custom shells around the editor.

### DateRangePill (P1)

- Current: hardcoded 7d/30d/90d/custom presets.
- Proposed:
  ```ts
  type DateRangePreset = { value: string; label: string };
  type DateRangePillProps = {
    value: string;
    onChange?: (next: string) => void;
    presets?: DateRangePreset[]; // default = today's 4 presets
    customSlot?: ReactNode; // renders below presets after a divider
    label?: string;
    className?: string;
  };
  ```

### SourcesSideSheet (P1)

- Current: typed `ConversationSource` with fixed sender/email/subject/snippet schema.
- Proposed:
  ```ts
  type SourcesSideSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string; // default "Sources"
    count?: number; // default = items.length
    items: ReactNode[]; // consumer renders each card
    className?: string;
  };
  // Convenience helper for the legacy mail-conversation card:
  // <SourcesSideSheet.MailItem source={...} />
  ```

### StatCardGrid (P1)

- Current: heading row hardcoded title + info icon; no slot for trailing actions.
- Proposed:
  ```ts
  type StatCardGridProps = {
    title: string;
    infoTooltip?: string;
    headerRight?: ReactNode; // new
    stats: StatCardProps[];
    renderStat?: (stat: StatCardProps, i: number) => ReactNode; // optional override
    className?: string;
  };
  ```

## Recommended Phase 13.2 batches

Each batch should land as a single PR that leaves Storybook bootable and the demo app working. Sized so the per-issue verification gate (tsc / build / harness / Storybook smoke) stays cheap.

1. **Batch A (P0, foundation):** `ArticleSettingsPanel` + extract `TagChip`/`AddChipButton`/`FieldBox`/`FieldLabel` to public exports. Highest extension likelihood, sets the composition-API template.
2. **Batch B (P0, AI review surface):** `AIGapSuggestionCard` + `AISuggestionsCard` + `SuggestionCard`. They share the AI review-flow vocabulary and a common typeRegistry pattern; refactoring them together avoids a half-migrated review surface.
3. **Batch C (P0, analytics surface):** `AIConversationLogEntry` + `AIConversationLogsCard`'s toolbar slot. Conversation log is the highest-traffic monolithic surface in analytics.
4. **Batch D (P1, shell + page chrome):** `KBBreadcrumbBar` + `PageHeader` + `StatCardGrid`. All three are page-level wrappers a PRD hits early.
5. **Batch E (P1, editor + overlays):** `ContentEditor` (extensions + toolbar slot + headless hook) + `SourcesSideSheet` items array + `DateRangePill` presets. Editor is the biggest item but has the most insulation already.

P2 / P3 work (`Dropdown`, `FileExplorerNav.renderItem`, `AnalyticsAreaChart` palette, slash registry, `Avatar.src`, etc.) can be picked up opportunistically after Batches A-E land.

## Open questions for the user

1. **Defaults vs clean-slate.** Should `ArticleSettingsPanel`, `SuggestionCard`, `AIGapSuggestionCard` keep the current hardcoded labels/actions as defaults (low BC risk, but the demo app still demonstrates the "monolithic" pattern) or should we delete the defaults entirely and force every consumer to pass `sections`/`actions`/`kindRegistry` (clean-slate, requires updating the demo + every story in the same PR)?
2. **`KBBreadcrumbBar` editor variant.** Are we OK dropping the `variant='category' | 'editor'` prop in favour of "did caller pass actions?", and shipping the Save/Publish/Close trio as a separate `EditorBreadcrumbActions` export — or should the variant prop stay for a release with a deprecation notice?
3. **`SourcesSideSheet` schema.** The hardcoded `ConversationSource` (`senderName`/`senderEmail`/`subject`/`snippet`/`timestamp`) maps cleanly to email source data but has zero generality. Do we want to keep it as a typed convenience (`<SourcesSideSheet.MailItem>`) and accept arbitrary `items: ReactNode[]` at the top level, or is the whole "side sheet of typed sources" surface one we should generalise into a re-usable `<SideSheet>` primitive that this lives on top of?
4. **`AIConversationLogEntry` row schema.** Is the dotted-connector left rail a hard visual invariant — meaning we should expose a `Row` atom + `extraRows: ReactNode[]` and keep the rendered order rigid — or should consumers be able to fully replace the row sequence (header / question / answer / sources / followup / tail) for non-conversation content (e.g. an "AI debug log" pane that reuses the same chrome but shows `prompt → response → tools-called → cost`)?
5. **Slash command registry.** `SLASH_COMMANDS` in `SlashCommandMenu.tsx` is currently a const array. Should `ContentEditor` accept a `slashCommands?: SlashCommand[]` prop (additive, easy) or expose an extension-host pattern where commands can be registered from outside the package (more work, lets the demo app add its own commands without forking)?
