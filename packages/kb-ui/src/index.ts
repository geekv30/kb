// @test-kb-ui/kb-ui — public API
// Components are exported here as they are built phase by phase.

export { cn } from './utils/cn';
export { smoothScrollTo, easings } from './utils/smoothScrollTo';
export type {
  SmoothScrollOptions,
  SmoothScrollHandle,
} from './utils/smoothScrollTo';
export { formatArticleTitle } from './utils/formatArticleTitle';
export { tokens } from './tokens';
export type { Tokens } from './tokens';

export * from './components/primitives';
export * from './components/nav';
export * from './components/content';
export * from './components/shell';
export * from './components/brand';
export * from './components/overlays';

// Hooks — state machines that consumers can drive their own UIs with.
export {
  useAIGapsReducer,
  initialAIGapsState,
  aiGapsReducer,
  isPublishEnabled,
  isAllReviewed,
  hasUndecidedNeighbour,
} from './hooks/useAIGapsReducer';
export type {
  AIGapsState,
  AIGapsAction,
  AIGapsMode,
  UseAIGapsReducerResult,
} from './hooks/useAIGapsReducer';
export { useAnchorPositions } from './hooks/useAnchorPositions';
export type { UseAnchorPositionsOptions } from './hooks/useAnchorPositions';
export {
  SidebarCollapseProvider,
  useSidebarCollapse,
} from './hooks/useSidebarCollapse';
export type {
  SidebarCollapseContextValue,
  SidebarCollapseProviderProps,
} from './hooks/useSidebarCollapse';
