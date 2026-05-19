// Public surface for the welcome-tour module.
//
// Consumers need:
//   - <WelcomeTourProvider steps welcome completion storageKey>
//   - useTourTarget(id) — ref callback to register DOM nodes
//   - useWelcomeTour() — escape-hatch into the state machine
//
// Everything else (overlay, cards, spotlight) is wired internally.

export {
  WelcomeTourProvider,
  useWelcomeTour,
  useTourTarget,
  isActiveTourState,
} from './WelcomeTourContext';
export type {
  TourState,
  TourPhase,
  TourStep,
  WelcomeContent,
  CompletionContent,
  WelcomeFeature,
  WelcomeTourProviderProps,
} from './WelcomeTourContext';
// SpotlightRect is part of the public surface because step configs
// can supply a `computeRect: (node) => SpotlightRect | null` callback
// for custom spotlight geometry.
export type { SpotlightRect } from './Spotlight';
