export { SubCategoriesTable } from './SubCategoriesTable';
export type { SubCategoriesTableProps, SubCategory } from './SubCategoriesTable';
export { ArticlesTable } from './ArticlesTable';
export type { ArticlesTableProps, Article } from './ArticlesTable';
export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';
export { ContentEditor } from './ContentEditor';
export type { ContentEditorProps } from './ContentEditor';
export { ArticleSettingsPanel } from './ArticleSettingsPanel';
export type {
  ArticleSettings,
  ArticleSettingsPanelProps,
  ArticleSettingsPerson,
  ArticleVisibility,
} from './ArticleSettingsPanel';
export { SuggestionCard } from './SuggestionCard';
export type {
  SuggestionCardProps,
  SuggestionKind,
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
export { SuggestionBlock } from './SuggestionBlock';
export type { SuggestionBlockProps } from './SuggestionBlock';
export { ArticleBody } from './ArticleBody';
export type {
  ArticleBodyProps,
  ArticleBodyDecisions,
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
export { DateRangePill } from './DateRangePill';
export type { DateRangePillProps, DateRange } from './DateRangePill';
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
export { ArticlesNeedsAttentionTable } from './ArticlesNeedsAttentionTable';
export type {
  ArticlesNeedsAttentionTableProps,
  ArticleAttentionRow,
} from './ArticlesNeedsAttentionTable';
export { ArticlePerformanceTable } from './ArticlePerformanceTable';
export type {
  ArticlePerformanceTableProps,
  ArticlePerformanceRow,
} from './ArticlePerformanceTable';
export { SearchKeywordsTable } from './SearchKeywordsTable';
export type {
  SearchKeywordsTableProps,
  SearchKeywordRow,
} from './SearchKeywordsTable';
export { ContentGapsTable } from './ContentGapsTable';
export type {
  ContentGapsTableProps,
  ContentGapRow,
} from './ContentGapsTable';
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
export { MostCitedArticlesTable } from './MostCitedArticlesTable';
export type {
  MostCitedArticlesTableProps,
  MostCitedRow,
} from './MostCitedArticlesTable';
