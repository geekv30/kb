// Phase 7.5.3 + 7.5.8 — Application entry point.
//
// Provider order (outside → inside):
//   1. <StrictMode>                       dev-only sanity wrapper
//   2. <ToastProvider>                    single-instance toast queue;
//                                          MUST sit OUTSIDE the router
//                                          so every route — including
//                                          standalone 404 — can call
//                                          `useToast()`.
//   3. <MockStoreProvider>                seeds the in-memory store;
//                                          survives navigation.
//   4. <EditorPageControllerProvider>     bridges editor-page handlers ↔
//                                          breadcrumb buttons.
//   5. <RouterProvider>                   data router; rerenders on
//                                          URL change.
//   6. <ShortcutsCheatSheet>              `?` overlay; mounted once at
//                                          app root (TRD §8.6).
//   7. <GlobalShortcutsHook>              wires `?` / Esc bindings.
//
// MockStoreProvider sits OUTSIDE the router so the seed runs exactly
// once and store state is preserved across route transitions. Same
// reasoning for ToastProvider and EditorPageControllerProvider.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Agentation } from 'agentation';
import { MockStoreProvider } from './store/MockStoreContext';
import { EditorPageControllerProvider } from './shell/EditorPageController';
import { ToastProvider } from './components/Toast';
import { ShortcutsCheatSheet } from './components/ShortcutsCheatSheet';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { router } from './router';
import './tokens.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

/**
 * Tiny wrapper component so we can call `useGlobalShortcuts()` —
 * which depends on hooks — from inside the React tree.
 */
function GlobalShortcutsBinder() {
  useGlobalShortcuts();
  return null;
}

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <MockStoreProvider>
        <EditorPageControllerProvider>
          <RouterProvider router={router} />
          <ShortcutsCheatSheet />
          <Agentation />
          <GlobalShortcutsBinder />
        </EditorPageControllerProvider>
      </MockStoreProvider>
    </ToastProvider>
  </StrictMode>,
);
