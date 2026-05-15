// Phase 7.5.3 — `/` redirector.
//
// PRD §4.1 / §6 Journey A step 1: landing on `/` redirects to the
// default KB category. Use `<Navigate replace>` so the back button
// doesn't return to a blank `/`.

import { Navigate, useLocation } from 'react-router-dom';
import { DEFAULT_KB_CATEGORY_SLUG, routes } from '../lib/routes';

export default function RedirectToDefault() {
  const { search } = useLocation();
  // Preserve the query string through the redirect so feature flags
  // like `?welcome=1` (the welcome-tour reset) reach the destination
  // route where the provider lives.
  return (
    <Navigate
      to={{ pathname: routes.kb.category(DEFAULT_KB_CATEGORY_SLUG), search }}
      replace
    />
  );
}
