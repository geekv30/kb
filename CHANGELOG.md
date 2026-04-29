# Changelog

All notable changes to `@test-kb-ui/kb-ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-04-28

Initial public release. Built across nine phases (0 through 7.5) culminating in a 56/56 cold-walk sign-off via the `apps/demo` integration harness.

### Added

#### Primitives

- `Button` (with `ButtonVariant`)
- `Badge` (with `BadgeVariant`)
- `Avatar`
- `TextInput`
- `Dropdown`
- `Divider`
- `Breadcrumb` (with `BreadcrumbItem`)
- `Card` (with `CardPadding`)

#### Shell

- `AppShell`
- `KBBreadcrumbBar` (with `KBBreadcrumbItem`)

#### Navigation

- `SideNavRail` (with `NavRailItem`)
- `FileExplorerNav` (with `NavItem`)

#### Content

- `DataTable` (with `DataTableColumn`)
- `PageHeader` (with `PageHeaderSize`)
- `ArticleBody` (with `ArticleBodyDecisions`, `ArticleSuggestionDecision`)
- `SuggestionBlock`
- `SuggestionCard` (with `SuggestionKind`, `SuggestionImpact`)
- `NavArrow`

#### Editor

- `ContentEditor` (Tiptap-based)
- `ArticleSettingsPanel` (with `ArticleSettings`, `ArticleSettingsPerson`, `ArticleVisibility`)

#### AI gaps surface

- `AISuggestionsCard` (with `AISuggestionsCardMode`)
- `AIGapSuggestionCard`
- `AICard` (with `AICardMode`)
- Shared types: `AISuggestion`, `AISuggestionType`, `AISuggestionDecision`, `AISuggestionState`

#### Analytics

- `StatCard` (with `StatTrendDirection`)
- `StatCardGrid`
- `DateRangePill` (with `DateRange`)
- `AnalyticsAreaChart` (with `AnalyticsAreaSeries`, `AnalyticsAreaChartGoalLine`, `AreaSeriesKey`)
- `AnalyticsDonutChart` (with `DonutDatum`)
- `AnalyticsChartCard`
- `HelpfulnessTag` (with `HelpfulnessVariant`)
- `AIConversationLogEntry` (with `AIConversationFeedback`, `AIConversationFollowUp`, `AIConversationTail`)
- `AIConversationLogsCard` (with `SortOption`)

#### Overlays

- `SourcesSideSheet` (with `ConversationSource`)

#### Brand

- `CompanyLogo`
- `AiIcon`

#### Hooks

- `useAIGapsReducer` plus `aiGapsReducer`, `initialAIGapsState`, `isPublishEnabled`, `isAllReviewed`
- Types: `AIGapsState`, `AIGapsAction`, `AIGapsMode`, `UseAIGapsReducerResult`

#### Foundations

- Design tokens (`tokens.ts` plus `tokens.css`) — colors (kb palette, AI gaps semantic palette, analytics chart palette), typography, spacing, border radius
- `import '@test-kb-ui/kb-ui/styles'` exposes the canonical Tailwind v4 plus tokens layer
- `cn` utility re-exported for class composition

[1.0.0]: https://github.com/geekv30/kb/releases/tag/v1.0.0
