// @hiver/kb-ui — public API
// Components are exported here as they are built phase by phase.

export { cn } from './utils/cn';
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
} from './hooks/useAIGapsReducer';
export type {
  AIGapsState,
  AIGapsAction,
  AIGapsMode,
  UseAIGapsReducerResult,
} from './hooks/useAIGapsReducer';
