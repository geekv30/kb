// Phase 7.5.2 — MockStore React Context + provider + hook.
//
// One context for the entire demo. `useReducer` is initialised lazily
// so `seed()` runs exactly once on first render (and never on subsequent
// renders, even with React StrictMode's double-invoke in dev — the
// initialiser receives the same `undefined` arg both times, but
// useReducer guarantees only one of those return values is kept).

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { rootReducer, type StoreAction } from './reducer';
import { seed } from './seed';
import type { MockStoreState } from './types';

type MockStoreContextValue = {
  state: MockStoreState;
  dispatch: (action: StoreAction) => void;
};

const MockStoreContext = createContext<MockStoreContextValue | null>(null);

export type MockStoreProviderProps = {
  children: ReactNode;
};

export function MockStoreProvider({ children }: MockStoreProviderProps) {
  const [state, dispatch] = useReducer(rootReducer, undefined, () => seed());
  return (
    <MockStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore(): MockStoreContextValue {
  const ctx = useContext(MockStoreContext);
  if (!ctx) {
    throw new Error(
      'useMockStore must be used inside <MockStoreProvider>. Wrap your app root in MockStoreProvider before consuming the store.',
    );
  }
  return ctx;
}
