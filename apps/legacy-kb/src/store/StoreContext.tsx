import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { rootReducer, type StoreAction } from './reducer';
import { seed } from './seed';
import type { StoreState } from './types';

type StoreContextValue = {
  state: StoreState;
  dispatch: (action: StoreAction) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export interface StoreProviderProps {
  children: ReactNode;
}

/** Seeds once on first render; state survives route changes. */
export function StoreProvider({ children }: StoreProviderProps) {
  const [state, dispatch] = useReducer(rootReducer, undefined, seed);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>.');
  return ctx;
}
