# demo-app-trd.md — Technical Requirements Document

> **Status:** DRAFT v1 — for review before implementation.
> **Contract:** This TRD is the engineering blueprint for the demo app specified in `demo-app-prd.md`. Where the PRD says **what** must happen, this doc says **how** and **where**. Every section here traces back to a specific PRD requirement.
> **Stakes:** $500 MRR feature extension. Production-grade quality bar (see PRD §3.4 + §12).

---

## 1. Tech Stack (locked)


| Layer         | Choice                                              | Version                              | Rationale                                                                     |
| ------------- | --------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| Build / dev   | **Vite**                                            | `^5.4`                               | Matches Storybook 8 pipeline, fastest HMR, zero-config TS                     |
| UI runtime    | **React**                                           | `^18.3` (peer dep of `@hiver/kb-ui`) | Required by kb-ui                                                             |
| Language      | **TypeScript**                                      | `^5.4`                               | Strict mode, matches kb-ui                                                    |
| Routing       | **React Router**                                    | `^6.26` (data router)                | `createBrowserRouter`, nested layouts, `useBlocker` for unsaved-changes guard |
| Styling       | **Tailwind CSS**                                    | `^4.1`                               | Same as kb-ui; share `tokens.css` via `@hiver/kb-ui/styles`                   |
| State         | **React Context + useReducer** (custom `MockStore`) | n/a                                  | No external state lib — keeps deps minimal, scope is bounded                  |
| Component lib | `**@hiver/kb-ui`**                                  | `workspace:*`                        | Linked via npm workspace                                                      |
| Workspace mgr | **npm workspaces**                                  | npm 10+                              | Already on system; no pnpm/yarn dep                                           |


**No new runtime dependencies beyond `@hiver/kb-ui`, `react`, `react-dom`, `react-router-dom`.** All UI primitives, icons, charts, and editors come transitively through kb-ui's existing deps.

**Dev-only deps:** `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `typescript`, `@types/react`, `@types/react-dom`.

---

## 2. Workspace Setup

The repo currently has no root `package.json`. `packages/kb-ui` is a standalone npm package. We're converting the repo to an npm workspace.

### 2.1 Root `package.json` (NEW)

```jsonc
{
  "name": "hiver-kb-monorepo",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/demo",
    "demo:dev": "npm run dev --workspace=apps/demo",
    "demo:build": "npm run build --workspace=apps/demo",
    "kb-ui:storybook": "npm run storybook --workspace=packages/kb-ui",
    "kb-ui:build": "npm run build --workspace=packages/kb-ui",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "build": "npm run build --workspaces --if-present"
  }
}
```

### 2.2 One-time prep (kb-ui side)

**Export `useAIGapsReducer` from `@hiver/kb-ui`.** Currently story-internal. The demo's AI Gaps page needs the reducer logic. Two options:

- **Option A (chosen):** Add it to `packages/kb-ui/src/index.ts` under a new `hooks/` namespace export. One-line change. Future external users get it too.
- Option B: Re-implement the reducer in the demo. Wasted code, silently drifts.

**Action:** Before Phase 7.5.2 dispatch, edit `packages/kb-ui/src/index.ts`:

```ts
export { useAIGapsReducer, initialAIGapsState } from './pages/useAIGapsReducer';
export type { AIGapsState, AIGapsAction } from './pages/useAIGapsReducer';
```

And move `useAIGapsReducer.ts` from `pages/` to `hooks/` (rename folder for cleaner public API surface). Verify Storybook stories still resolve the import after the move.

### 2.3 Install + verify

```bash
cd /Users/varunkelkar/Desktop/ai/kb
npm install
npm run typecheck   # both packages should pass
```

---

## 3. File Structure (`apps/demo/`)

```
apps/demo/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── README.md
├── postcss.config.js              # if Tailwind v4 needs it (test during scaffold)
├── public/                        # empty for v1; reserved for future static assets
└── src/
    ├── main.tsx                   # ReactDOM.createRoot, Router, providers
    ├── App.tsx                    # NOT a component — re-exports the router config
    ├── tokens.css                 # imports '@hiver/kb-ui/styles' + demo-only utilities
    │
    ├── router.tsx                 # createBrowserRouter() with full route tree (lazy)
    │
    ├── routes/
    │   ├── ShellLayout.tsx        # Layout: rail + sub-nav + breadcrumb + <Outlet />
    │   ├── CollapsedShellLayout.tsx  # Layout: breadcrumb only + <Outlet /> (no rail/sub-nav)
    │   ├── RedirectToDefault.tsx  # '/' → '/kb/getting-started'
    │   │
    │   ├── kb/
    │   │   ├── CategoryPage.tsx   # /kb/:topLevel/:mid?/:depth2?
    │   │   └── EditorPage.tsx     # /articles/:articleSlug/edit
    │   │
    │   ├── ai-optimise/
    │   │   ├── HubPage.tsx        # /ai-optimise
    │   │   └── ReviewPage.tsx     # /ai-optimise/:articleSlug/review
    │   │
    │   ├── analytics/
    │   │   ├── ArticlePerformancePage.tsx
    │   │   ├── SearchPage.tsx
    │   │   └── AIAnswerPerformancePage.tsx
    │   │
    │   ├── SettingsPlaceholder.tsx
    │   └── NotFoundPage.tsx
    │
    ├── shell/                     # Route-aware wrappers around kb-ui shell components
    │   ├── AppRail.tsx            # SideNavRail bound to active section + nav handlers
    │   ├── EditorExplorer.tsx     # FileExplorerNav for /kb section, tree-state from store
    │   ├── AnalyticsExplorer.tsx  # FileExplorerNav variant=flat for /analytics
    │   ├── AISubNavbar.tsx        # AISubNav for /ai-optimise
    │   └── BreadcrumbBar.tsx      # KBBreadcrumbBar with route-derived items + handlers
    │
    ├── store/
    │   ├── MockStoreContext.tsx   # Context + Provider + useMockStore() hook
    │   ├── reducer.ts             # Top-level store reducer + action types
    │   ├── selectors.ts           # Pure derived-state functions
    │   ├── seed.ts                # Seeds the store on mount (calls fixtures)
    │   ├── fixtures/
    │   │   ├── users.ts
    │   │   ├── categories.ts
    │   │   ├── articles.ts        # All 56 articles with real bodies
    │   │   ├── suggestions.ts     # 9 suggestions across 3 articles
    │   │   ├── conversations.ts   # 12 conversation sources
    │   │   └── analytics.ts       # All static analytics fixtures
    │   └── types.ts               # User, Category, Article, AISuggestion, ...
    │
    ├── components/                # Demo-only UI (not in kb-ui)
    │   ├── Toast.tsx              # Toast UI + ToastProvider + useToast() hook
    │   ├── ConfirmDialog.tsx      # Used by unsaved-changes guard
    │   ├── ShortcutsCheatSheet.tsx  # '?' overlay
    │   ├── RouteTransition.tsx    # 150ms cross-fade for content slot
    │   ├── EmptyState.tsx         # Centered text + optional CTA
    │   └── PageProgressBar.tsx    # Top thin bar during code-split chunk loads
    │
    ├── hooks/
    │   ├── useUnsavedChangesGuard.ts  # Wraps React Router useBlocker
    │   ├── useFocusOnRouteChange.ts   # Refocus h1 / editor on nav
    │   ├── useGlobalShortcuts.ts      # Cmd+S, Cmd+Enter, Esc, '?'
    │   ├── useAIGapsForArticle.ts     # Per-article reducer state from store
    │   └── useToastDispatcher.ts      # Sugar on useToast for common cases
    │
    └── lib/
        ├── slugify.ts             # category/article slug helper
        └── routes.ts              # Typed route helpers: routes.kb.category(slug)
```

**Total new files:** ~38. No file should exceed ~200 lines except `articles.ts` (fixtures, ~600 lines) and `EditorPage.tsx` / `ReviewPage.tsx` (composition + handlers, ~250 each).

---

## 4. Routing Architecture

### 4.1 Route table

```ts
// router.tsx (sketch)
export const router = createBrowserRouter([
  { path: '/', element: <RedirectToDefault /> },

  // Shell layout — rail + sub-nav + breadcrumb persist
  {
    element: <ShellLayout />,
    children: [
      // KB browse
      { path: '/kb/:topLevel', lazy: () => import('./routes/kb/CategoryPage') },
      { path: '/kb/:topLevel/:mid', lazy: () => import('./routes/kb/CategoryPage') },
      { path: '/kb/:topLevel/:mid/:depth2', lazy: () => import('./routes/kb/CategoryPage') },

      // AI Optimise hub
      { path: '/ai-optimise', lazy: () => import('./routes/ai-optimise/HubPage') },

      // Analytics
      { path: '/analytics', element: <Navigate to="/analytics/article-performance" replace /> },
      { path: '/analytics/article-performance', lazy: () => import('./routes/analytics/ArticlePerformancePage') },
      { path: '/analytics/search', lazy: () => import('./routes/analytics/SearchPage') },
      { path: '/analytics/ai-answer-performance', lazy: () => import('./routes/analytics/AIAnswerPerformancePage') },

      // Settings placeholder
      { path: '/settings', element: <SettingsPlaceholder /> },
    ],
  },

  // Collapsed-shell layout — breadcrumb only, full-width content
  {
    element: <CollapsedShellLayout />,
    children: [
      { path: '/articles/:articleSlug/edit', lazy: () => import('./routes/kb/EditorPage') },
      { path: '/ai-optimise/:articleSlug/review', lazy: () => import('./routes/ai-optimise/ReviewPage') },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
```

### 4.2 URL design rationale

- **Browse paths** mirror category hierarchy (`/kb/managing-emails/shared-inboxes/permissions-access`) — readable, shareable, deep-linkable.
- **Article URL is flat** (`/articles/:slug/edit`) — articles have unique slugs globally; deeply nested URLs (`/kb/.../.../articleSlug/edit`) are brittle when articles move categories. Flat URL is robust + matches industry pattern (Notion, Confluence).
- **AI Gaps URL** uses article slug too (`/ai-optimise/:articleSlug/review`). Returning to `/ai-optimise` shows the hub.

### 4.3 Active-state derivation

```ts
// In ShellLayout, compute rail-active section from useLocation():
const pathname = useLocation().pathname;
const activeSection =
  pathname.startsWith('/kb') ? 'editor' :
  pathname.startsWith('/articles') ? 'editor' :     // editor route, but rail says editor
  pathname.startsWith('/ai-optimise') ? 'ai' :
  pathname.startsWith('/analytics') ? 'analytics' :
  pathname.startsWith('/settings') ? 'settings' :
  'editor';
```

### 4.4 Breadcrumb derivation

`BreadcrumbBar.tsx` reads the current route + store, builds breadcrumb items:

- `/kb/:topLevel/:mid?/:depth2?` → `[topLevel, mid?, depth2?]` from category store, all clickable
- `/articles/:slug/edit` → full ancestor chain via `article.categoryId` walk + article title (last segment, font-medium)
- `/ai-optimise` → `[{ label: 'AI Optimise' }]` (single, non-clickable)
- `/ai-optimise/:slug/review` → article ancestor chain + article title (editor variant, with publish/save/×)
- `/analytics/*` → `[{ label: 'Analytics' }]` (single)
- `/settings` → `[{ label: 'Settings' }]`

### 4.5 Lazy loading + Suspense

Every page route is `React.lazy`-loaded via Vite's dynamic import. Wrap `<Outlet />` in `<Suspense fallback={<PageProgressBar />} />` inside both layout routes. Initial bundle ships the shell + redirect only; first navigation pulls the route chunk.

### 4.6 404 + error boundary

- `path: '*'` → `NotFoundPage` rendered standalone (no shell).
- Each layout route gets a `errorElement={<RouteErrorBoundary />}` that renders inside the shell with "Something went wrong. Reload."

---

## 5. State Management (`MockStore`)

### 5.1 State shape

```ts
// store/types.ts
export type User = {
  id: string;
  name: string;
  initials: string;     // 'AK'
  avatarColor: string;  // tailwind color name or hex
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  parentId: string | null;
  depth: 0 | 1 | 2 | 3;
};

export type ArticleSettings = {
  slug: string;
  tags: string[];
  publishDate: string | null;       // ISO date, null when draft
  seoTitle: string;
  visibility: 'public' | 'private';
  reviewerIds: string[];
};

export type Article = {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  status: 'draft' | 'published';
  authorId: string;
  lastUpdatedAt: string;            // ISO
  bodyHTML: string;                 // for the editor
  settings: ArticleSettings;
};

export type AISuggestion = {
  id: string;
  articleId: string;
  type: 'addition' | 'replace' | 'removal';
  title: string;
  description: string;
  anchorBlockId: string;            // matches data-block-id in article body
  payload: { newHTML?: string; oldHTML?: string };
  sourceCount: number;
  status: 'pending' | 'accepted' | 'dismissed' | 'published';
};

export type ConversationSource = {
  id: string;
  articleId: string;                // which article's source list this belongs to
  sender: { name: string; email: string };
  timestamp: string;
  subject: string;
  snippet: string;
};

// Re-exported from @hiver/kb-ui after the one-time prep:
import type { AIGapsState } from '@hiver/kb-ui';

export type ToastVariant = 'success' | 'error' | 'info';
export type Toast = { id: string; message: string; variant: ToastVariant };

export type MockStoreState = {
  // Domain entities (id-keyed maps)
  users: Record<string, User>;
  categories: Record<string, Category>;
  articles: Record<string, Article>;
  suggestions: Record<string, AISuggestion>;
  conversationSources: Record<string, ConversationSource>;
  
  // Per-article AI Gaps reducer state — lazy-initialized on first access
  aiGapsStateByArticle: Record<string, AIGapsState>;
  
  // Session state (not domain, but lives here for convenience)
  expandedCategoryIds: string[];    // tree expansion persistence
  currentUserId: string;            // 'aanya' for the demo persona
  
  // Toast queue (single-instance)
  currentToast: Toast | null;
};
```

### 5.2 Actions

```ts
// store/reducer.ts
export type StoreAction =
  // Editor
  | { type: 'editor/saveDraft'; articleId: string; bodyHTML: string; settings: ArticleSettings }
  | { type: 'editor/publish'; articleId: string }
  | { type: 'editor/createNew'; categoryId: string; newArticleId: string; newSlug: string }
  | { type: 'editor/discardNew'; articleId: string }

  // AI Gaps
  | { type: 'aiGaps/dispatch'; articleId: string; action: AIGapsAction }
  | { type: 'aiGaps/publish'; articleId: string }
  | { type: 'aiGaps/reset'; articleId: string }

  // Tree
  | { type: 'tree/toggleExpanded'; categoryId: string }

  // Toast
  | { type: 'toast/show'; toast: Toast }
  | { type: 'toast/dismiss' };
```

The `aiGaps/dispatch` action wraps the kb-ui reducer:

```ts
case 'aiGaps/dispatch': {
  const current = state.aiGapsStateByArticle[action.articleId] ?? initialAIGapsState;
  const next = aiGapsReducer(current, action.action);   // imported from @hiver/kb-ui
  return { ...state, aiGapsStateByArticle: { ...state.aiGapsStateByArticle, [action.articleId]: next } };
}
```

The `aiGaps/publish` action:

1. Reads all suggestions for the article
2. For each `accepted` suggestion: applies `payload.newHTML` to the article body at `anchorBlockId`
3. For each `dismissed` suggestion: leaves body as-is (already reverted in derived state)
4. Sets all those suggestions' status to `'published'`
5. Sets `article.status` to `'published'`
6. Clears `aiGapsStateByArticle[articleId]`
7. Fires a success toast

### 5.3 Provider + hook

```ts
// store/MockStoreContext.tsx
const MockStoreContext = createContext<{
  state: MockStoreState;
  dispatch: (action: StoreAction) => void;
} | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, undefined, () => seed());
  return <MockStoreContext.Provider value={{ state, dispatch }}>{children}</MockStoreContext.Provider>;
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error('useMockStore must be used inside MockStoreProvider');
  return ctx;
}
```

### 5.4 Selectors (pure)

Co-located in `store/selectors.ts`. Examples:

```ts
export const selectArticleBySlug = (state: MockStoreState, slug: string): Article | undefined =>
  Object.values(state.articles).find(a => a.slug === slug);

export const selectCategoryAncestors = (state: MockStoreState, categoryId: string): Category[] => {
  const out: Category[] = [];
  let curr = state.categories[categoryId];
  while (curr) {
    out.unshift(curr);
    curr = curr.parentId ? state.categories[curr.parentId] : null!;
  }
  return out;
};

export const selectArticlesInCategory = (state: MockStoreState, categoryId: string): Article[] =>
  Object.values(state.articles).filter(a => a.categoryId === categoryId);

export const selectPendingSuggestionArticles = (state: MockStoreState): Article[] => {
  const articleIds = new Set(
    Object.values(state.suggestions)
      .filter(s => s.status === 'pending')
      .map(s => s.articleId)
  );
  return [...articleIds].map(id => state.articles[id]).filter(Boolean);
};

export const selectExplorerTree = (state: MockStoreState): NavItem[] => {
  // Build NavItem[] tree from state.categories + state.articles
  // Maps to FileExplorerNav's NavItem shape (which kb-ui exports)
  // Honors state.expandedCategoryIds for default expansion
};
```

### 5.5 Why no Zustand / Redux / etc.

- Single context, single reducer, ~10 action types. Not big enough to justify the dep.
- The only "global" state is the mock store; everything else is route-derived or local.
- Keeps the demo's cognitive surface tiny — anyone reading the code sees React primitives only.

---

## 6. Mock Data Layer

### 6.1 Seed function

`store/seed.ts` returns a fully-populated `MockStoreState` synchronously. Called once on mount via `useReducer(_, _, () => seed())`. **No async, no fetches.**

```ts
// store/seed.ts
import { users } from './fixtures/users';
import { categories } from './fixtures/categories';
import { articles } from './fixtures/articles';
import { suggestions } from './fixtures/suggestions';
import { conversationSources } from './fixtures/conversations';

export function seed(): MockStoreState {
  return {
    users: keyBy(users, 'id'),
    categories: keyBy(categories, 'id'),
    articles: keyBy(articles, 'id'),
    suggestions: keyBy(suggestions, 'id'),
    conversationSources: keyBy(conversationSources, 'id'),
    aiGapsStateByArticle: {},
    expandedCategoryIds: ['cat-getting-started'],   // default expansion
    currentUserId: 'user-aanya',
    currentToast: null,
  };
}
```

### 6.2 Fixture file responsibilities


| File               | Contents                                                                    | Approx LOC |
| ------------------ | --------------------------------------------------------------------------- | ---------- |
| `users.ts`         | 6 user objects, hand-written                                                | 30         |
| `categories.ts`    | 23 category objects (5 top-level + 14 mid + 4 depth-2), hand-written        | 120        |
| `articles.ts`      | 56 article objects with real titles + ~300-word bodies                      | 600        |
| `suggestions.ts`   | 9 suggestion objects across 3 articles                                      | 80         |
| `conversations.ts` | 12 conversation source objects (4 per AI-targeted article)                  | 100        |
| `analytics.ts`     | Static JSON for stat-card values, area-chart series, donut data, table rows | 250        |


**Article body authoring strategy (for ui-engineer):** Provide a writing template per category type (e.g., "setup", "automation", "integration"). The agent fills in 56 articles using realistic tone. The 3 AI-targeted articles get extra-careful authoring with `data-block-id` markers placed where suggestion anchors will attach.

### 6.3 Data integrity invariants (assert at seed time in dev)

```ts
// In seed(), after building all entities, run cheap dev-only asserts:
if (import.meta.env.DEV) {
  // Every article has a valid categoryId
  Object.values(state.articles).forEach(a => {
    if (!state.categories[a.categoryId]) console.error(`article ${a.id} → unknown category ${a.categoryId}`);
  });
  // Every category (except root) has a valid parentId
  Object.values(state.categories).forEach(c => {
    if (c.parentId && !state.categories[c.parentId]) console.error(`category ${c.id} → unknown parent`);
  });
  // Every suggestion has a valid articleId AND that article has matching anchor IDs
  Object.values(state.suggestions).forEach(s => {
    const article = state.articles[s.articleId];
    if (!article) return console.error(`suggestion ${s.id} → unknown article`);
    if (!article.bodyHTML.includes(`data-block-id="${s.anchorBlockId}"`))
      console.error(`suggestion ${s.id} → anchor ${s.anchorBlockId} not in article body`);
  });
}
```

Stripped in prod build.

---

## 7. Component Composition Map

For each route, the kb-ui components used and the demo wrappers around them.

### 7.1 `ShellLayout` (layout route)

```tsx
<AppShell
  rail={<AppRail />}                       /* wraps SideNavRail */
  explorer={<RouteAwareExplorer />}        /* picks EditorExplorer / AISubNavbar / AnalyticsExplorer / null */
  breadcrumb={<BreadcrumbBar />}           /* wraps KBBreadcrumbBar */
>
  <Suspense fallback={<PageProgressBar />}>
    <RouteTransition>
      <Outlet />
    </RouteTransition>
  </Suspense>
</AppShell>
```

`RouteAwareExplorer`:

```tsx
function RouteAwareExplorer() {
  const path = useLocation().pathname;
  if (path.startsWith('/kb')) return <EditorExplorer />;
  if (path.startsWith('/ai-optimise')) return <AISubNavbar />;
  if (path.startsWith('/analytics')) return <AnalyticsExplorer />;
  return null;  // Settings: no explorer
}
```

### 7.2 `CollapsedShellLayout` (layout route)

```tsx
<AppShell
  sidebarCollapsed
  breadcrumb={<BreadcrumbBar />}
>
  <Suspense fallback={<PageProgressBar />}>
    <RouteTransition>
      <Outlet />
    </RouteTransition>
  </Suspense>
</AppShell>
```

### 7.3 `CategoryPage` (`/kb/...`)


| kb-ui                | Used as                                              |
| -------------------- | ---------------------------------------------------- |
| `PageHeader`         | Title + subtitle from category, "+ New" CTA on right |
| `SubCategoriesTable` | If category has child categories, list them          |
| `ArticlesTable`      | Articles in this category                            |


Handlers wired:

- `+ New` → dispatch `editor/createNew`, navigate to `/articles/<newSlug>/edit`
- SubCategoryRow click → `navigate(/kb/...)`
- ArticleRow click → `navigate(/articles/<slug>/edit)`
- Empty state if no articles AND no subcategories → `<EmptyState />` with CTA

### 7.4 `EditorPage` (`/articles/:slug/edit`)


| kb-ui                  | Used as                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `ContentEditor`        | Tiptap editor seeded with `article.bodyHTML`, onChange marks dirty     |
| `ArticleSettingsPanel` | Right column, fields bound to article.settings, onChange updates store |


Handlers wired:

- Editor onChange → local dirty flag + debounced store write (200ms)
- Settings field change → dispatch `editor/saveDraft` (just settings, body unchanged) → marks dirty cleared for settings-only changes
- Cmd+S → dispatch `editor/saveDraft` with current body+settings → toast "Draft saved."
- Cmd+Enter → dispatch `editor/publish` → toast "Article published." → navigate to category page
- Breadcrumb × → unsaved-changes guard → navigate to category page
- Mount: `useFocusOnRouteChange` puts caret in editor body
- New-article URL detection: if article was created via `editor/createNew` and user discards (× without saving), dispatch `editor/discardNew` to remove the empty draft

### 7.5 `HubPage` (`/ai-optimise`)


| kb-ui                 | Used as                                  |
| --------------------- | ---------------------------------------- |
| `SuggestionCard` (×N) | One per article with pending suggestions |


Handlers:

- Card click → `navigate(/ai-optimise/<articleSlug>/review)`
- Empty state if `selectPendingSuggestionArticles` returns []

### 7.6 `ReviewPage` (`/ai-optimise/:slug/review`)


| kb-ui                      | Used as                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| `ArticleBody`              | Article HTML + `decisions` prop derived from suggestion statuses    |
| `ArticleSettingsPanel`     | Right rail, defaultCollapsed                                        |
| `AISuggestionsCard`        | Pre-review or terminal mode based on reducer state                  |
| `AIGapSuggestionCard` (×3) | Per suggestion, state derived from suggestion + reducer activeIndex |
| `SourcesSideSheet`         | Open when `state.sourcesFor != null`                                |


Handlers:

- All button clicks → `dispatch({ type: 'aiGaps/dispatch', articleId, action: ... })`
- Keyboard shortcuts → same, gated by `useGlobalShortcuts`
- Publish → dispatch `aiGaps/publish` → toast → navigate to `/ai-optimise`
- Close × → if any decisions: confirm dialog → dispatch `aiGaps/reset` → navigate. Else navigate immediately.

The reducer state is read via `useAIGapsForArticle(articleId)`:

```ts
export function useAIGapsForArticle(articleId: string) {
  const { state, dispatch } = useMockStore();
  const aiGapsState = state.aiGapsStateByArticle[articleId] ?? initialAIGapsState;
  const dispatchAction = (action: AIGapsAction) =>
    dispatch({ type: 'aiGaps/dispatch', articleId, action });
  return [aiGapsState, dispatchAction] as const;
}
```

### 7.7 Analytics pages (3 routes)

Each is a thin composition: `PageHeader` + `DateRangePill` (no-op + toast) + chart cards + tables.

- Tables that link to articles: row click → `navigate(/articles/<slug>/edit)` if article exists in store, else no-op.
- DateRangePill click → toast "Coming soon."

### 7.8 `SettingsPlaceholder`

Centered text "Settings — coming soon." Inside the shell.

### 7.9 `NotFoundPage`

Standalone (no shell). Centered "404 — Page not found." + button "Back to home" → `/`.

---

## 8. Cross-Cutting Infrastructure

### 8.1 Toast system

```tsx
// components/Toast.tsx
type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: crypto.randomUUID(), message, variant });
    const duration = variant === 'error' ? 5000 : 3000;
    timer.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <ToastUI toast={toast} onDismiss={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
```

`ToastUI` is a simple fixed div, top-right (16px from edges), z-index 100, color-coded left border, autohide via parent timer.

### 8.2 Unsaved-changes guard

```ts
// hooks/useUnsavedChangesGuard.ts
export function useUnsavedChangesGuard(isDirty: boolean, message = 'You have unsaved changes. Discard?') {
  // Block in-app nav
  const blocker = useBlocker(isDirty);

  // Block tab close / refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Render the confirm dialog when blocker triggers
  return blocker.state === 'blocked' ? (
    <ConfirmDialog
      message={message}
      onConfirm={() => blocker.proceed()}
      onCancel={() => blocker.reset()}
    />
  ) : null;
}
```

Used in `EditorPage` and `ReviewPage`. The dialog component lives in `components/ConfirmDialog.tsx` and reuses Radix Dialog (already a kb-ui dep — import direct).

### 8.3 Focus management

```ts
// hooks/useFocusOnRouteChange.ts
export function useFocusOnRouteChange(targetSelector: string = 'h1') {
  const location = useLocation();
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (el) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }, [location.pathname]);
}
```

Called in `ShellLayout` and `CollapsedShellLayout`. Routes can override via local effect (e.g., editor focuses Tiptap body).

### 8.4 Route transitions

`RouteTransition` wraps content in a div with `transition: opacity 150ms`. On route change (detected via `useLocation().key`), key the div so React unmounts/remounts → fade-in. Out-fade is skipped (would need exit animation lib; not worth it for 150ms).

### 8.5 Global keyboard shortcuts

```ts
// hooks/useGlobalShortcuts.ts
export function useGlobalShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // '?' opens cheat sheet (when not in input)
      if (!isEditable && e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('demo:open-shortcuts'));
      }
      // Esc dismisses cheat sheet
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('demo:close-shortcuts'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

Mounted at app root. Editor-specific shortcuts (Cmd+S, Cmd+Enter) live in `EditorPage` to avoid coupling. AI Gaps shortcuts (j/k/y/n/Esc) come from existing kb-ui reducer wiring.

### 8.6 Cheat sheet (`?` overlay)

Listens for the custom events from §8.5. Renders a modal listing every shortcut. Single component, no per-page registration.

### 8.7 Error boundary

Per-layout `errorElement` renders a simple "Something went wrong." card inside the shell. No telemetry — this is a demo.

---

## 9. Build Configuration

### 9.1 `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Workspace link works via npm workspaces; alias only if needed for deep imports
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'tiptap': ['@tiptap/react', '@tiptap/starter-kit'],
          'recharts': ['recharts'],
        },
      },
    },
  },
});
```

### 9.2 `tsconfig.json`

Extends a permissive base; adds `"strict": true`, `"jsx": "react-jsx"`, `"moduleResolution": "bundler"`. Shared with kb-ui's existing tsconfig style.

### 9.3 `apps/demo/package.json`

```jsonc
{
  "name": "@hiver/kb-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hiver/kb-ui": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@tailwindcss/vite": "^4.1.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.4.0",
    "vite": "^5.4.0"
  }
}
```

### 9.4 `index.html`

Standard Vite template. `<title>Hiver KB</title>`. Single `<div id="root"></div>` + module script.

### 9.5 Tokens import

`src/tokens.css`:

```css
@import '@hiver/kb-ui/styles';

/* Demo-only utilities (toast colors, transitions) */
@layer utilities {
  .animate-toast-in { animation: toastIn 200ms ease-out; }
  @keyframes toastIn { from { opacity: 0; transform: translateY(-8px); } }
}
```

Imported once in `main.tsx`.

---

## 10. Code-Splitting & Bundle Plan


| Chunk                               | Loaded when                  | Approx size (target, gzip)                 |
| ----------------------------------- | ---------------------------- | ------------------------------------------ |
| `index` (initial)                   | Page load                    | <150kb (React + Router + shell + redirect) |
| `category`                          | First /kb/* visit            | <50kb                                      |
| `editor` (incl. Tiptap)             | First /articles/*/edit visit | <250kb                                     |
| `ai-optimise`                       | First /ai-optimise/* visit   | <60kb                                      |
| `review` (incl. ArticleBody, sheet) | First review visit           | <80kb                                      |
| `analytics` (incl. Recharts)        | First /analytics/* visit     | <200kb                                     |


**Initial-load target:** <250kb gzip, first paint <1s on a warm cache.

`manualChunks` in §9.1 ensures Tiptap and Recharts are not duplicated across analytics + editor chunks.

---

## 11. Implementation Phases (ui-engineer dispatch breakdown)

Each phase is a separate ui-engineer dispatch with a self-contained brief. Phases run sequentially unless marked parallel.

### Phase 7.5.1 — Workspace + scaffold + boot

- Add root `package.json` with workspaces config
- Pre-step: export `useAIGapsReducer` from kb-ui (move file, update index.ts, verify Storybook)
- Create `apps/demo/` with vite/tailwind/tsconfig/index.html/main.tsx
- Single "hello world" route to verify toolchain
- **Done when:** `npm run dev` shows the placeholder, `npm run typecheck` passes both packages

### Phase 7.5.2 — MockStore + types + seed (atoms only)

- Write `store/types.ts`, `store/reducer.ts`, `store/MockStoreContext.tsx`, `store/selectors.ts`
- Write all 6 fixture files. **Realistic content** (per PRD §3.4 + §13). For `articles.ts`, the agent writes 56 article bodies — must be substantive, in-domain.
- Wire `MockStoreProvider` at app root
- **Done when:** dev-only seed assertions pass, devtools can inspect store state

### Phase 7.5.3 — Shell + routing skeleton

- `ShellLayout` + `CollapsedShellLayout`
- Route-aware wrappers: `AppRail`, `EditorExplorer`, `AnalyticsExplorer`, `AISubNavbar`, `BreadcrumbBar`
- Router config with all routes (each lazy, all pointing to placeholder pages with just `<h1>{routeName}</h1>`)
- 404 + `RedirectToDefault`
- Tree-expansion store wiring for `EditorExplorer`
- **Done when:** every route in §4.1 navigates correctly, rail/sub-nav highlight correctly, breadcrumb derives correctly

### Phase 7.5.4 — Category page (Journey A core)

- `routes/kb/CategoryPage.tsx` with PageHeader + SubCategoriesTable + ArticlesTable + EmptyState
- Tree expansion + collapse interactions in `EditorExplorer`
- "+ New" → store mutation + navigate
- Article row click → navigate to editor (placeholder OK)
- Multi-depth navigation (depth 2, 3) verified
- **Done when:** Journey A steps 1–6 + 12 are complete

### Phase 7.5.5 — Editor page (Journey A continuation)

- `routes/kb/EditorPage.tsx`: ContentEditor + ArticleSettingsPanel
- Save draft / Publish actions wired with toast feedback
- Cmd+S, Cmd+Enter shortcuts
- Unsaved-changes guard (blocker + beforeunload)
- - New flow with discard handling
- Focus management (caret in editor on mount)
- **Done when:** Journey A steps 7–11, 13–16 complete

### Phase 7.5.6 — AI Optimise (Journey B)

- `HubPage`: derived suggestion-count cards + empty state
- `ReviewPage`: ArticleBody + reducer integration via `useAIGapsForArticle`
- Sources sheet wiring
- Publish flow: applies decisions to article body, marks suggestions published
- Reset on close-with-decisions confirm
- Mid-flow persistence verified (navigate away, return, resume)
- **Done when:** Journey B steps 1–10 + ALT branch complete; 3 distinct articles each with own 3 suggestions

### Phase 7.5.7 — Analytics (Journey C)

- 3 analytics pages (mostly composition, presentation-only)
- Sub-nav switching between tabs
- Table-row → editor deep-links (validate article IDs match store)
- DateRangePill / sort dropdown / source link → "Coming soon" toast
- **Done when:** Journey C complete; chart hover tooltips work

### Phase 7.5.8 — Polish pass

- Toast system end-to-end (audit all user-facing actions for toast coverage)
- Cheat sheet overlay
- Empty states everywhere PRD §12.5 lists
- Branded 404
- Code-splitting verified (network tab shows separate chunks)
- Bundle-size budget check
- Focus management verified across all routes
- 150ms transition wired
- Accessibility floor (tab order, aria-labels)
- **Done when:** PRD §12 spec is fully met

### Phase 7.5.9 — Verification + sign-off

- `apps/demo/README.md` (install, dev, build, deploy)
- Manual journey checklist (PRD §11) walked end-to-end
- `npm run typecheck` clean both packages
- `npm run build` produces deployable `apps/demo/dist/`
- `vite preview` serves the build correctly
- `logs.md` and `plan.md` updated with Phase 7.5 entry
- Memory updated (project_kb_phase_status.md)
- **Done when:** PRD §11 acceptance criteria all check

**Total estimated dispatches:** 9. **Estimated wall time:** ~3–4 days of focused ui-engineer work assuming the fixture content (Phase 7.5.2) is the bottleneck.

---

## 12. Verification Plan

### 12.1 Static checks (every phase)

- `npm run typecheck` passes both packages
- No `console.log` in shipped code (grep before sign-off)
- No `// TODO` comments without an associated PRD §10 deferral note

### 12.2 Manual journey QA (Phase 7.5.9)

Walk all three journeys A/B/C from PRD §6 step-by-step. Mark each step complete. Mark each edge case in PRD §9 verified or explicitly deferred.

### 12.3 Bundle audit

Run `npm run build` and inspect `dist/assets/*.js` sizes. Confirm:

- `index-*.js` < 250kb gzip
- Tiptap + Recharts in their own chunks (search bundle for `Tiptap` / `Recharts` strings to verify boundary)

### 12.4 Optional — Playwright smoke test

**Deferred to Phase 8 unless time permits.** A single `tests/journey-a.spec.ts` Playwright file that walks Journey A end-to-end and asserts the article badge flips published. Wires into existing `packages/kb-ui/scripts/capture-stories.mjs` infrastructure. Adds 30 min, gives confidence.

### 12.5 Demo dry-run

Before declaring Phase 7.5 complete, the user (or a designated reviewer) opens the deployed/preview build cold and walks all 3 journeys without a script. Issues found = follow-up tasks, not "done."

---

## 13. Phase 8 Implications

This work materially improves Phase 8 (npm publish) in two ways:

1. **Public API audit, free.** Every kb-ui import in the demo proves an export works. Anything the demo can't import cleanly is a Phase 8 fix-list item BEFORE publish.
2. `**useAIGapsReducer` becomes public.** This is a real API decision (the reducer + types are now part of the package contract). Worth a brief in the Phase 8 release notes.

Phase 8 should NOT begin until Phase 7.5 sign-off. The demo is the integration test.

---

## 14. Risks & Mitigations


| Risk                                                                              | Mitigation                                                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Tailwind v4 plugin compat between kb-ui and demo (different vite plugin versions) | Pin same `@tailwindcss/vite` version in both packages. Verify in Phase 7.5.1 boot.                              |
| Workspace link breaks on `npm install`                                            | Test immediately after adding root package.json; fall back to `file:` link if needed                            |
| Tiptap CSS doesn't load in demo (kb-ui ships it)                                  | Confirm via the `@import '@hiver/kb-ui/styles'` step. The package's `exports` field already exposes `./styles`. |
| 56 article bodies too tedious to author                                           | Use a writing template per category type; the ui-engineer can batch-author with consistent tone                 |
| Mid-flow AI Gaps state lost on hot reload during dev                              | Acceptable — refresh wipes per PRD §10 decision 10                                                              |
| Bundle size blows past 500kb on first analytics visit (Recharts is heavy)         | Already chunked via `manualChunks`; if still over budget, split per-chart-type                                  |
| React Router `useBlocker` deprecation / quirks                                    | Pin to v6.26+; fall back to `prompt`-style guard if API changes                                                 |


---

## 15. Out of Scope (technical)

- **Tests** beyond the optional Playwright smoke (PRD is the spec; manual QA is the verification)
- **CI/CD** — no GitHub Actions for the demo (manual build + deploy)
- **Telemetry / analytics on the demo itself** — no tracking
- **Service worker / offline mode** — not needed
- **PWA manifest** — not a PWA
- **i18n infrastructure** — out per PRD
- **Storybook for demo components** — Storybook stays in kb-ui only
- **Hot-reloading of fixture data** — refresh required (acceptable per PRD)

---

*End of TRD draft v1. Awaiting approval before implementation begins.*