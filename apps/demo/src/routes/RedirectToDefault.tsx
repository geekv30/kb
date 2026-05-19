// Phase 7.5.3 — `/` redirector.
//
// PRD §4.1 / §6 Journey A step 1: landing on `/` redirects to the
// default KB category — the FIRST top-level folder in the explorer
// tree. We derive the slug from `selectFirstCategorySlug(state)` so
// this redirect agrees by construction with the FileExplorerNav's own
// ordering. Use `<Navigate replace>` so the back button doesn't return
// to a blank `/`.
//
// Defensive: if the store somehow has zero folders, render nothing
// (no crash, no infinite redirect). The mock store always has folders
// in practice.

import { Navigate, useLocation } from 'react-router-dom';
import { useMockStore } from '../store/MockStoreContext';
import { selectFirstCategorySlug } from '../store/selectors';
import { routes } from '../lib/routes';

export default function RedirectToDefault() {
  const { search } = useLocation();
  const { state } = useMockStore();
  const slug = selectFirstCategorySlug(state);

  if (!slug) return null;

  // Preserve the query string through the redirect so feature flags
  // like `?welcome=1` (the welcome-tour reset) reach the destination
  // route where the provider lives.
  return (
    <Navigate
      to={{ pathname: routes.kb.category(slug), search }}
      replace
    />
  );
}
