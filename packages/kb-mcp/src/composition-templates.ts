// Hand-curated `compositionSnippet` templates used by
// `recommend_components_for_prd`.
//
// The picker (in `tools/recommend-components-for-prd.ts`) walks this list in
// order and returns the snippet for the first template whose `primaryFor`
// array contains any of the top-2 recommended component names. The
// `generic-page` fallback (empty `primaryFor`) is always last and matches
// nothing automatically — the picker falls back to it explicitly.
//
// Snippet shape rules:
//   - Real importable component names from `@test-kb-ui/kb-ui`.
//   - 15–40 lines of TSX, syntactically valid, copy-pasteable.
//   - `// ...` comments where the consumer fills in their own data.
//   - Column configs / sample data don't have to be runtime-perfect; the
//     snippet is a starting composition, not a runnable demo.

export type CompositionTemplate = {
  /** Identifier for the template, used in logs/debug. */
  id: string;
  /**
   * Component names whose presence in the recommendation triggers this
   * template. Listed roughly in priority order; the first template whose
   * `primaryFor` intersects the top-2 recommended components wins.
   */
  primaryFor: string[];
  /** Human-readable label, e.g. "KB category / browse page". */
  label: string;
  /** TSX source — the snippet itself. */
  snippet: string;
};

export const compositionTemplates: CompositionTemplate[] = [
  {
    id: 'editor-page',
    primaryFor: ['ContentEditor', 'ArticleSettingsPanel'],
    label: 'Article editor',
    snippet: `import {
  AppShell,
  KBBreadcrumbBar,
  ContentEditor,
  ArticleSettingsPanel,
  type ArticleSettings,
} from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

const settings: ArticleSettings = {
  // ... fill from your article record (visibility, owner, tags, etc.)
};

export function ArticleEditorPage() {
  return (
    <AppShell
      sidebarCollapsed
      breadcrumb={
        <KBBreadcrumbBar
          variant="editor"
          sidebarCollapsed
          items={[{ label: 'Knowledge Base' }, { label: 'Untitled article' }]}
          onPublish={() => {/* publish */}}
          onSaveDraft={() => {/* save draft */}}
        />
      }
    >
      <div style={{ display: 'flex', gap: 24 }}>
        <ContentEditor
          // initialContent={...}
          onChange={(html) => {/* persist */}}
        />
        <ArticleSettingsPanel
          settings={settings}
          onChange={(next) => {/* persist settings */}}
        />
      </div>
    </AppShell>
  );
}
`,
  },

  {
    id: 'ai-gaps-review',
    primaryFor: ['AIGapSuggestionCard', 'ArticleBody', 'AISuggestionsCard'],
    label: 'AI Gaps review experience',
    snippet: `import {
  AppShell,
  SideNavRail,
  KBBreadcrumbBar,
  ArticleBody,
  AISuggestionsCard,
  AIGapSuggestionCard,
  SourcesSideSheet,
} from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

export function AIGapsReviewPage() {
  return (
    <AppShell
      rail={<SideNavRail items={[/* your nav */]} activeId="ai" theme="dark" />}
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={[{ label: 'AI Optimise' }, { label: 'AI Gaps' }]}
        />
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <ArticleBody
          // article={...}  decisions={...}  onDecide={...}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AISuggestionsCard
            // suggestions={...}  mode="pre-review"
          />
          {/* Repeat <AIGapSuggestionCard /> for each inline suggestion */}
          <AIGapSuggestionCard
            // suggestion={...}  onAccept={...}  onDismiss={...}
          />
        </div>
      </div>
      <SourcesSideSheet
        // open={...}  sources={...}  onClose={...}
      />
    </AppShell>
  );
}
`,
  },

  {
    id: 'ai-optimise-hub',
    primaryFor: ['SuggestionCard', 'AICard'],
    label: 'AI Optimise hub',
    snippet: `import {
  AppShell,
  SideNavRail,
  KBBreadcrumbBar,
  SuggestionCard,
} from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

export function AIOptimiseHub() {
  return (
    <AppShell
      rail={<SideNavRail items={[/* your nav */]} activeId="ai" theme="dark" />}
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={[{ label: 'AI Optimise' }]}
        />
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <SuggestionCard kind="gap" /* impact, count, onClick */ />
        <SuggestionCard kind="outdated" />
        <SuggestionCard kind="duplicate" />
      </div>
    </AppShell>
  );
}
`,
  },

  {
    id: 'analytics-article-performance',
    primaryFor: ['StatCardGrid', 'AnalyticsAreaChart'],
    label: 'Analytics — article performance',
    snippet: `import {
  AppShell,
  SideNavRail,
  FileExplorerNav,
  KBBreadcrumbBar,
  PageHeader,
  StatCardGrid,
  AnalyticsAreaChart,
  AnalyticsDonutChart,
  DateRangePill,
  DataTable,
  type DataTableColumn,
} from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

type ArticleRow = { id: string; title: string; views: number; helpfulness: string };

const columns: DataTableColumn<ArticleRow>[] = [
  { id: 'title', header: 'Article', render: (r) => r.title },
  { id: 'views', header: 'Views', render: (r) => r.views.toLocaleString() },
  { id: 'helpfulness', header: 'Helpfulness', render: (r) => r.helpfulness },
];

export function ArticlePerformancePage({ rows }: { rows: ArticleRow[] }) {
  return (
    <AppShell
      rail={<SideNavRail items={[/* your nav */]} activeId="analytics" theme="light" />}
      explorer={<FileExplorerNav items={[/* analytics sub-items */]} />}
      breadcrumb={<KBBreadcrumbBar variant="category" items={[{ label: 'Analytics' }]} />}
    >
      <PageHeader title="Article performance" />
      <DateRangePill /* value, onChange */ />
      <StatCardGrid stats={[/* { label, value, delta } */]} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <AnalyticsAreaChart /* series, xAxis, yAxis */ />
        <AnalyticsDonutChart /* slices */ />
      </div>
      <DataTable rows={rows} columns={columns} />
    </AppShell>
  );
}
`,
  },

  {
    id: 'analytics-search',
    primaryFor: ['DateRangePill', 'AnalyticsChartCard'],
    label: 'Analytics — search performance',
    snippet: `import {
  AppShell,
  SideNavRail,
  FileExplorerNav,
  KBBreadcrumbBar,
  PageHeader,
  DateRangePill,
  AnalyticsChartCard,
  AnalyticsAreaChart,
  DataTable,
  type DataTableColumn,
} from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

type SearchRow = { id: string; keyword: string; searches: number; ctr: string };

const columns: DataTableColumn<SearchRow>[] = [
  { id: 'keyword', header: 'Keyword', render: (r) => r.keyword },
  { id: 'searches', header: 'Searches', render: (r) => r.searches.toLocaleString() },
  { id: 'ctr', header: 'CTR', render: (r) => r.ctr },
];

export function SearchAnalyticsPage({ rows }: { rows: SearchRow[] }) {
  return (
    <AppShell
      rail={<SideNavRail items={[/* your nav */]} activeId="analytics" theme="light" />}
      explorer={<FileExplorerNav items={[/* analytics sub-items */]} />}
      breadcrumb={<KBBreadcrumbBar variant="category" items={[{ label: 'Analytics' }]} />}
    >
      <PageHeader title="Search performance" />
      <DateRangePill /* value, onChange */ />
      <AnalyticsChartCard title="Searches over time">
        <AnalyticsAreaChart /* series, xAxis, yAxis */ />
      </AnalyticsChartCard>
      <DataTable rows={rows} columns={columns} />
    </AppShell>
  );
}
`,
  },

  {
    id: 'category-page',
    primaryFor: ['DataTable', 'PageHeader', 'FileExplorerNav'],
    label: 'KB category / browse page',
    snippet: `import {
  AppShell,
  SideNavRail,
  FileExplorerNav,
  KBBreadcrumbBar,
  PageHeader,
  DataTable,
  type DataTableColumn,
} from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

type Article = { id: string; title: string; status: 'published' | 'draft'; updatedAt: string };

const columns: DataTableColumn<Article>[] = [
  { id: 'title', header: 'Title', render: (a) => a.title },
  { id: 'status', header: 'Status', render: (a) => a.status },
  { id: 'updatedAt', header: 'Updated', render: (a) => a.updatedAt },
];

export function CategoryPage({ items }: { items: Article[] }) {
  return (
    <AppShell
      rail={<SideNavRail items={[/* your nav */]} activeId="kb" theme="light" />}
      explorer={<FileExplorerNav items={[/* category tree */]} />}
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={[{ label: 'Knowledge Base' }, { label: 'Category' }]}
        />
      }
    >
      <PageHeader title="Articles" /* onPrimaryAction={() => {}} */ />
      <DataTable rows={items} columns={columns} />
    </AppShell>
  );
}
`,
  },

  {
    id: 'generic-page',
    primaryFor: [],
    label: 'Generic AppShell + content area',
    snippet: `import {
  AppShell,
  SideNavRail,
  KBBreadcrumbBar,
  Card,
} from '@test-kb-ui/kb-ui';
import '@test-kb-ui/kb-ui/styles';

export function NewKBPage() {
  return (
    <AppShell
      rail={<SideNavRail items={[/* your nav */]} activeId="kb" theme="light" />}
      breadcrumb={
        <KBBreadcrumbBar
          variant="category"
          items={[{ label: 'Knowledge Base' }, { label: 'New page' }]}
        />
      }
    >
      <Card>
        {/* Your content here. Compose with any other kb-ui components. */}
      </Card>
    </AppShell>
  );
}
`,
  },
];
