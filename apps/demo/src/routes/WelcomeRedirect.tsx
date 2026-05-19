// `/welcome` — force-starts the welcome tour for any visitor.
//
// On mount: clears the seen flag in localStorage so the
// WelcomeTourProvider's auto-show logic will fire on the next render.
// Then redirects to the default landing route with `?welcome=1` so
// the provider's existing query-param reset path also kicks in
// (belt-and-suspenders — either mechanism alone would suffice).
//
// Use the `replace` navigation so the back button doesn't return to
// `/welcome` — that would just re-trigger the tour again.
//
// Landing slug is derived from the store's first folder via
// `selectFirstCategorySlug` so it stays in lockstep with
// RedirectToDefault and the AppRail Editor click target.

import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useMockStore } from '../store/MockStoreContext';
import { selectFirstCategorySlug } from '../store/selectors';
import { routes } from '../lib/routes';
import { HIVER_TOUR_STORAGE_KEY } from '../components/welcome-tour-config';

export default function WelcomeRedirect() {
  // Strict-mode runs effects twice in dev — gate so we only clear once.
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    try {
      window.localStorage.removeItem(HIVER_TOUR_STORAGE_KEY);
    } catch {
      // Storage may be unavailable (private mode) — the ?welcome=1
      // query param path will still trigger the tour.
    }
  }, []);

  const { state } = useMockStore();
  const slug = selectFirstCategorySlug(state);

  if (!slug) return null;

  return (
    <Navigate
      to={{
        pathname: routes.kb.category(slug),
        search: '?welcome=1',
      }}
      replace
    />
  );
}
