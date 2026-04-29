export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';
export { PageHeader } from './PageHeader';
export type { PageHeaderProps, PageHeaderSize } from './PageHeader';
export { ContentEditor } from './ContentEditor';
export type { ContentEditorProps } from './ContentEditor';
export { ArticleSettingsPanel } from './ArticleSettingsPanel';
export type {
  ArticleSettings,
  ArticleSettingsPanelProps,
  ArticleSettingsPerson,
  ArticleSettingsSection,
  ArticleVisibility,
} from './ArticleSettingsPanel';
export {
  FieldLabel,
  FieldBox,
  ChevronSuffix,
  CharCounter,
  Placeholder,
  TagChip,
  AddChipButton,
} from './ArticleSettingsPanelAtoms';
export type {
  FieldBoxProps,
  TagChipProps,
} from './ArticleSettingsPanelAtoms';
export { SuggestionCard, DEFAULT_SUGGESTION_KINDS } from './SuggestionCard';
export type {
  SuggestionCardProps,
  SuggestionKind,
  SuggestionKindMeta,
  SuggestionImpact,
} from './SuggestionCard';

/* ── AI suggestion review surface (Phase 6) ────────────────── */
export { AISuggestionsCard } from './AISuggestionsCard';
export type {
  AISuggestionsCardProps,
  AISuggestionsCardMode,
} from './AISuggestionsCard';
export { AIGapSuggestionCard } from './AIGapSuggestionCard';
export type { AIGapSuggestionCardProps } from './AIGapSuggestionCard';
export { AICard } from './AICard';
export type { AICardProps, AICardMode } from './AICard';
export { NavArrow } from './NavArrow';
export type { NavArrowProps } from './NavArrow';
export { SuggestionBlock } from './SuggestionBlock';
export type { SuggestionBlockProps } from './SuggestionBlock';
export { ArticleBody } from './ArticleBody';
export type {
  ArticleBodyProps,
  ArticleBodyDecisions,
  ArticleBodyRegions,
  ArticleSuggestionDecision,
} from './ArticleBody';
export type {
  AISuggestion,
  AISuggestionType,
  AISuggestionDecision,
  AISuggestionState,
} from './ai-suggestion-types';

/* ── Analytics surfaces (Phase 7) ───────────────────────────── */
export { StatCard } from './StatCard';
export type { StatCardProps, StatTrendDirection } from './StatCard';
export { StatCardGrid } from './StatCardGrid';
export type { StatCardGridProps } from './StatCardGrid';
export { DateRangePill, DEFAULT_DATE_RANGE_PRESETS } from './DateRangePill';
export type { DateRangePillProps, DateRange, DateRangePreset } from './DateRangePill';
export { AnalyticsAreaChart } from './AnalyticsAreaChart';
export type {
  AnalyticsAreaChartProps,
  AnalyticsAreaSeries,
  AnalyticsAreaChartGoalLine,
  AreaSeriesKey,
} from './AnalyticsAreaChart';
export { AnalyticsDonutChart } from './AnalyticsDonutChart';
export type { AnalyticsDonutChartProps, DonutDatum } from './AnalyticsDonutChart';
export { AnalyticsChartCard } from './AnalyticsChartCard';
export type { AnalyticsChartCardProps } from './AnalyticsChartCard';
export { HelpfulnessTag } from './HelpfulnessTag';
export type { HelpfulnessTagProps, HelpfulnessVariant } from './HelpfulnessTag';
export { AIConversationLogEntry } from './AIConversationLogEntry';
export type {
  AIConversationLogEntryProps,
  AIConversationFeedback,
  AIConversationFollowUp,
  AIConversationTail,
} from './AIConversationLogEntry';
export { AIConversationLogsCard } from './AIConversationLogsCard';
export type {
  AIConversationLogsCardProps,
  SortOption,
} from './AIConversationLogsCard';
