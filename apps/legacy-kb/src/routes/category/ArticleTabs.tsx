import { Tabs, type TabOption } from '../../components/ui/Tabs';
import type { ArticleFilter } from '../../store/selectors';

const TABS: ReadonlyArray<TabOption<ArticleFilter>> = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'PUBLISHED', label: 'Published' },
];

export interface ArticleTabsProps {
  value: ArticleFilter;
  onChange: (value: ArticleFilter) => void;
}

/** Category page status tabs: All / Drafts / Published. */
export function ArticleTabs({ value, onChange }: ArticleTabsProps) {
  return <Tabs tabs={TABS} value={value} onChange={onChange} label="Article status" />;
}
