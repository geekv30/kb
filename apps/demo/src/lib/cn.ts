// Re-export of `cn` from `@test-kb-ui/kb-ui`.
//
// Demo-side modules import `cn` from this local helper rather than
// reaching into `@test-kb-ui/kb-ui` directly. Two reasons:
//   1. Single import surface — one line to swap if the demo ever wants
//      its own className merger.
//   2. Keeps callsites short and readable (`from '../lib/cn'`).
export { cn } from '@test-kb-ui/kb-ui';
