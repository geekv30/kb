// Public surface for the welcome-tour prototype module.
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
