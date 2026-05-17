export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';
export { PageHeader } from './PageHeader';
export type { PageHeaderProps, PageHeaderSize } from './PageHeader';
export { ContentEditor, DEFAULT_TOOLBAR_ITEMS } from './ContentEditor';
export type { ContentEditorProps, ToolbarItemDef } from './ContentEditor';
export { ArticleTitleInput } from './ArticleTitleInput';
export type { ArticleTitleInputProps } from './ArticleTitleInput';
export { DEFAULT_SLASH_COMMANDS } from './SlashCommandMenu';
export type { SlashCommand } from './SlashCommandMenu';
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
export { AIGapSuggestionCard, DEFAULT_GAP_TYPES } from './AIGapSuggestionCard';
export type { AIGapSuggestionCardProps, SuggestionTypeMeta } from './AIGapSuggestionCard';
export { AICard } from './AICard';
export type { AICardProps, AICardMode } from './AICard';
export { NavArrow } from './NavArrow';
export type { NavArrowProps } from './NavArrow';
export { SuggestionBlock, SuggestionHighlight } from './SuggestionBlock';
export type {
  SuggestionBlockProps,
  SuggestionSentence,
} from './SuggestionBlock';
export { ArticleBody } from './ArticleBody';
export type {
  ArticleBodyProps,
  ArticleBodyDecisions,
  ArticleBodyRegions,
  ArticleBodySuggestionIds,
  ArticleSuggestionDecision,
} from './ArticleBody';
export { AIGapRail } from './AIGapRail';
export type { AIGapRailProps, AIGapRailItem } from './AIGapRail';
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
export { AnalyticsAreaChart, DEFAULT_SERIES_PALETTE } from './AnalyticsAreaChart';
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
export { ConversationRow } from './AIConversationLogEntryAtoms';
export type { ConversationRowProps } from './AIConversationLogEntryAtoms';
export { AIConversationLogsCard } from './AIConversationLogsCard';
export type {
  AIConversationLogsCardProps,
  SortOption,
} from './AIConversationLogsCard';
