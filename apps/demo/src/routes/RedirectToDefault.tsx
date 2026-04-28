// Phase 7.5.3 — `/` redirector.
//
// PRD §4.1 / §6 Journey A step 1: landing on `/` redirects to the
// default KB category. Use `<Navigate replace>` so the back button
// doesn't return to a blank `/`.

import { Navigate } from 'react-router-dom';
import { DEFAULT_KB_CATEGORY_SLUG, routes } from '../lib/routes';

export default function RedirectToDefault() {
  return <Navigate to={routes.kb.category(DEFAULT_KB_CATEGORY_SLUG)} replace />;
}
