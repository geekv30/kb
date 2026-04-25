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
