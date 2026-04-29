# Hiver KB Component Library

`@test-kb-ui/kb-ui` is the React component library that powers Hiver's knowledge base product (`app.hiverkb.com`). It exists so designers, PMs, and engineers can assemble any new KB feature directly from a PRD — every primitive, nav surface, content block, editor, AI gap reviewer, and analytics card needed to match the product is already in the box, with 1:1 Figma fidelity.

- npm: [`@test-kb-ui/kb-ui`](https://www.npmjs.com/package/@test-kb-ui/kb-ui)
- Demo app: see "Explore" below

## Install

```bash
npm install @test-kb-ui/kb-ui
```

## Use it from Claude Code

This repo ships as a Claude Code plugin — installing it wires the kb-mcp server straight into your CLI, so you can ask Claude for a kb-ui composition from a plain-English PRD.

```bash
/plugin marketplace add geekv30/kb
/plugin install kb-mcp@test-kb-ui
```

Then, in any Claude Code session: *"Build me a settings page where admins manage AI gap rules — propose a kb-ui composition."*

## Quickstart

```tsx
import { AppShell, KBBreadcrumbBar, SideNavRail, FileExplorerNav } from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

export function App() {
  return (
    <AppShell
      rail={<SideNavRail items={[]} activeId="home" />}
      explorer={<FileExplorerNav items={[]} />}
      breadcrumb={<KBBreadcrumbBar items={[{ id: 'home', label: 'Knowledge base' }]} />}
    >
      {/* your KB content here */}
    </AppShell>
  );
}
```

## What's in the box

About 40 components, organized by role:

- **Primitives** — `Button`, `Badge`, `Avatar`, `TextInput`, `Dropdown`, `Divider`, `Breadcrumb`, `Card`
- **Shell** — `AppShell`, `KBBreadcrumbBar`
- **Navigation** — `SideNavRail`, `FileExplorerNav`
- **Content** — `DataTable`, `PageHeader`, `ArticleBody`, `SuggestionBlock`, `SuggestionCard`, `NavArrow`
- **Editor** (Tiptap-based) — `ContentEditor`, `ArticleSettingsPanel`
- **AI gaps surface** — `AISuggestionsCard`, `AIGapSuggestionCard`, `AICard`
- **Analytics** — `StatCard`, `StatCardGrid`, `DateRangePill`, `AnalyticsAreaChart`, `AnalyticsDonutChart`, `AnalyticsChartCard`, `HelpfulnessTag`, `AIConversationLogEntry`, `AIConversationLogsCard`
- **Overlays** — `SourcesSideSheet`
- **Brand** — `CompanyLogo`, `AiIcon`
- **Hooks** — `useAIGapsReducer` (with `aiGapsReducer`, `initialAIGapsState`, `isPublishEnabled`, `isAllReviewed` and `AIGapsState` / `AIGapsAction` / `AIGapsMode` types)

## Explore

- **Storybook** — `npm run kb-ui:storybook` from the repo root (local for now; hosted Storybook is a future phase).
- **Demo app** — `npm run demo:dev` from the repo root, launches a Vite app stitching every Phase 3-7 page pattern into one navigable product.

## Tech stack

React 18 + TypeScript strict, Tailwind CSS v4, Radix UI primitives, Tiptap (editor), Recharts (analytics), `@remixicon/react` (icons), tsup (build).

## License

MIT
