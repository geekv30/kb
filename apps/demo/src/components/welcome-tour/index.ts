// Public surface for the welcome-tour prototype module.
//
// Consumers only need the Provider + the `useTourTarget` ref-callback
// hook (to register DOM nodes that subsequent steps will spotlight).
// Everything else (overlay, card, spotlight) is wired internally.

export { WelcomeTourProvider, useWelcomeTour, useTourTarget } from './WelcomeTourContext';
export type { TourState, TourTargetId } from './WelcomeTourContext';
