// Phase 7.5.3 — Route-aware wrapper around `FileExplorerNav` for the
// Editor surface (`/kb/*` and `/articles/*`).
//
// Tree shape comes from `selectExplorerTree(state)` (built once per
// render — selector is cheap given fixture sizes). Active item is
// derived from the current route:
//   - On `/kb/.../<slug>` the deepest category in the path is active.
//   - On `/articles/<slug>/edit` the article id matching that slug is
//     active (the explorer auto-expands its category ancestors).
//
// Click behaviour:
//   - Folder click  → dispatch `tree/toggleExpanded` (store-side bookkeeping
//     so future selectors can read the persisted set; FileExplorerNav also
//     keeps its own local expansion state) AND, if the folder is a
//     category, navigate to its category page.
//   - Article click → navigate to the editor URL for that article slug.
//
// Per-row actions (2026-05-14 — dispatch B + C):
//   - `renderRowAction` → per-row 3-dot trigger + "Edit" item. On a
//     folder row Edit opens NewCategoryModal in `edit` mode pre-filled
//     from the matching category; on an article row Edit navigates to the
//     article's editor URL.
//   - Modal is edit-mode only here. The create-mode entry-point lives in
//     CategoryPage's PageHeader "+ New" dropdown — see CategoryPage.tsx.
//   - The dropdown chrome (container + item) is shared from
//     `./DropdownMenuItem.tsx` so EditorExplorer and CategoryPage stay
//     pixel-identical — see Figma node `1958:34638`.

import { useCallback, useMemo, useState } from 'react';
import * as RxDropdownMenu from '@radix-ui/react-dropdown-menu';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DotsVertical, Pencil02 } from '@untitledui/icons';
import {
  FileExplorerNav,
  NewCategoryModal,
  cn,
  type NavItem,
  type NewCategoryFormValues,
  type ParentCategoryOption,
} from '@test-kb-ui/kb-ui';
import { useMockStore } from '../store/MockStoreContext';
import {
  selectArticleBySlug,
  selectCategoryBySlug,
  selectExplorerTree,
} from '../store/selectors';
import { routes } from '../lib/routes';
import {
  DropdownMenuItem,
  DROPDOWN_CONTENT_CLASSES,
} from './DropdownMenuItem';

/* ──────────────────────────────────────────────────────────────
 * Flatten helpers
 * ────────────────────────────────────────────────────────────── */

/**
 * Recursively flatten the tree into a list of (node, parents-from-root)
 * pairs. Used to map a category id back to the URL segments needed to
 * navigate to it (`/kb/topLevel/mid?/depth2?`).
 */
type FlatNode = { node: NavItem; ancestors: NavItem[] };

function flattenTree(items: NavItem[], ancestors: NavItem[] = []): FlatNode[] {
  const out: FlatNode[] = [];
  for (const node of items) {
    out.push({ node, ancestors });
    if (node.children && node.children.length > 0) {
      out.push(...flattenTree(node.children, [...ancestors, node]));
    }
  }
  return out;
}

/* ──────────────────────────────────────────────────────────────
 * Modal state — edit-mode only here. (Create-mode lives in
 * CategoryPage, behind the PageHeader "+ New > Folder" item.)
 * ────────────────────────────────────────────────────────────── */

type ModalState =
  | { open: false }
  | {
      open: true;
      mode: 'edit';
      initialValues: Partial<NewCategoryFormValues>;
      categoryId: string;
    };

export function EditorExplorer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // We read URL params if available — but this component renders for
  // every shell route, so params can be empty (e.g. on /ai-optimise).
  const params = useParams<{
    topLevel?: string;
    mid?: string;
    depth2?: string;
    articleSlug?: string;
  }>();
  const { state, dispatch } = useMockStore();

  const items = useMemo(() => selectExplorerTree(state), [state]);
  const flat = useMemo(() => flattenTree(items), [items]);

  /* ── Active id derivation ───────────────────────────────────── */

  const activeId = useMemo<string | undefined>(() => {
    // Editor route — find the article id by slug.
    if (pathname.startsWith('/articles/') && params.articleSlug) {
      const article = selectArticleBySlug(state, params.articleSlug);
      return article?.id;
    }
    // KB route — deepest URL segment maps to a category slug.
    const slug = params.depth2 ?? params.mid ?? params.topLevel;
    if (!slug) return undefined;
    const cat = selectCategoryBySlug(state, slug);
    return cat?.id;
  }, [pathname, params, state]);

  /* ── Parent options for NewCategoryModal (depth-0 categories) ── */

  const parentOptions = useMemo<ParentCategoryOption[]>(
    () =>
      Object.values(state.categories)
        .filter((c) => c.parentId === null)
        .map((c) => ({ id: c.id, label: c.title })),
    [state.categories],
  );

  /* ── Modal state ────────────────────────────────────────────── */

  const [modalState, setModalState] = useState<ModalState>({ open: false });
  const closeModal = useCallback(() => setModalState({ open: false }), []);

  const handleModalSubmit = useCallback(
    (values: NewCategoryFormValues) => {
      // The store reducer doesn't currently expose categories/update —
      // mutating mock data is out of scope for this dispatch. Log + close
      // so reviewers can see the payload.
      if (modalState.open && modalState.mode === 'edit') {
        // eslint-disable-next-line no-console
        console.log('TODO: update category', modalState.categoryId, values);
      }
      closeModal();
    },
    [modalState, closeModal],
  );

  /* ── Click handler ──────────────────────────────────────────── */

  const handleItemClick = useCallback(
    (id: string) => {
      const hit = flat.find((f) => f.node.id === id);
      if (!hit) return;
      const { node, ancestors } = hit;

      if (node.type === 'article') {
        // Articles in our tree carry the `art-<slug>` id pattern but the
        // canonical slug source is the store. Look it up to be safe.
        const article = state.articles[id];
        if (article) navigate(routes.article(article.slug));
        return;
      }

      // Folder = category. Toggle expansion in the store (bookkeeping)
      // and navigate to the category page when one exists.
      dispatch({ type: 'tree/toggleExpanded', categoryId: id });

      const category = state.categories[id];
      if (!category) return;

      // Build the URL from the ancestor chain. Top-level categories
      // (depth 0) use /kb/<slug>; depth 1 → /kb/<root>/<mid>; depth 2 →
      // /kb/<root>/<mid>/<depth2>.
      const allCats = [...ancestors, node]
        .map((n) => state.categories[n.id])
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      const slugs = allCats.map((c) => c.slug);

      let targetUrl: string | undefined;
      if (slugs.length === 1) targetUrl = routes.kb.category(slugs[0]);
      else if (slugs.length === 2) targetUrl = routes.kb.sub(slugs[0], slugs[1]);
      else if (slugs.length >= 3)
        targetUrl = routes.kb.deep(slugs[0], slugs[1], slugs[2]);

      // Guard the navigate() call: same-URL navigations generate a new
      // location.key and would trigger a spurious route-fade replay.
      // The toggleExpanded dispatch above still runs unconditionally so
      // the folder collapse/expand toggle works on same-route clicks.
      if (targetUrl && targetUrl !== pathname) navigate(targetUrl);
    },
    [flat, state, dispatch, navigate, pathname],
  );

  /* ── renderRowAction — per-row 3-dot menu ──────────────────── */

  const openEditFolderModal = useCallback(
    (categoryId: string) => {
      const cat = state.categories[categoryId];
      if (!cat) return;
      const initialValues: Partial<NewCategoryFormValues> = {
        name: cat.title,
        parentCategoryId: cat.parentId ?? undefined,
        description: cat.subtitle,
        // iconKey intentionally left undefined — the demo store doesn't
        // track icon identifiers (the modal's icon picker is a stub).
      };
      setModalState({
        open: true,
        mode: 'edit',
        initialValues,
        categoryId,
      });
    },
    [state.categories],
  );

  const renderRowAction = useCallback(
    (item: NavItem) => {
      const onEdit = () => {
        if (item.type === 'folder') {
          openEditFolderModal(item.id);
        } else {
          // Article: navigate to its editor URL.
          const article = state.articles[item.id];
          if (article) navigate(routes.article(article.slug));
        }
      };
      return (
        <RxDropdownMenu.Root>
          <RxDropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${item.title}`}
              // Stop propagation on mousedown so Radix-managed focus
              // shifts don't also trigger the row button's onClick.
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-[4px]',
                'text-text-meta hover:bg-[#f1f5f9]',
                'focus:outline-none focus:ring-2 focus:ring-[#cbd5e1]',
              )}
            >
              <DotsVertical aria-hidden="true" className="h-4 w-4" />
            </button>
          </RxDropdownMenu.Trigger>
          <RxDropdownMenu.Portal>
            <RxDropdownMenu.Content
              align="end"
              sideOffset={4}
              className={DROPDOWN_CONTENT_CLASSES}
            >
              <DropdownMenuItem
                label="Edit"
                icon={<Pencil02 aria-hidden="true" />}
                onSelect={onEdit}
              />
            </RxDropdownMenu.Content>
          </RxDropdownMenu.Portal>
        </RxDropdownMenu.Root>
      );
    },
    [openEditFolderModal, navigate, state.articles],
  );

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <>
      <FileExplorerNav
        title="Editor"
        items={items}
        activeId={activeId}
        onItemClick={handleItemClick}
        renderRowAction={renderRowAction}
      />
      {/* Conditionally render the modal so its internal form state
       *  resets between open/close cycles — the modal seeds `useState`
       *  from `initialValues` only on first mount, so a long-lived
       *  instance would otherwise carry stale Edit-mode pre-fills into
       *  subsequent opens.
       */}
      {modalState.open && (
        <NewCategoryModal
          open
          onOpenChange={(next) => {
            if (!next) closeModal();
          }}
          mode={modalState.mode}
          initialValues={modalState.initialValues}
          parentOptions={parentOptions}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
}
