// Phase 7.5 chunk-5 — Mock AI service for the SEO panel's
// "✦ Refine with AI" affordance on the description textarea.
//
// The real product wires `onRefineDescription` to a remote LLM call;
// the demo ships a deterministic mock that:
//   - Waits 1500ms to feel like a real network round-trip
//   - Returns one of a handful of Hiver-flavoured copy variants
//   - Picks the variant deterministically off the input string's
//     length, so refreshing on localhost yields the same output
//     for the same input (no flicker / no demo-day surprises).
//
// Used by `apps/demo/src/routes/kb/EditorPage.tsx` via
// `<ArticleSettingsPanel onRefineDescription={refineDescription}>`.

const CANNED_REFINEMENT_TEMPLATES: ReadonlyArray<string> = [
  'Step-by-step guide to setting up shared inboxes in Hiver — invite teammates, configure routing rules, and resolve common access issues.',
  'Configure Hiver to handle support inboxes shared across your team. Covers permissions, routing, and access management for shared mailboxes.',
  'Set up your first Hiver shared inbox in under five minutes. Walkthrough covers team invites, assignments, and access-error troubleshooting.',
  'Get your team collaborating in shared Gmail inboxes with Hiver. Includes onboarding, routing rules, and resolving permission errors quickly.',
  'Onboard your team to shared inboxes in Hiver — from invites to assignment routing — with answers to the access errors that come up first.',
] as const;

/** Simulated network latency in milliseconds. Tuned to feel like a
 *  real LLM call without making the demo feel sluggish. */
const REFINE_LATENCY_MS = 1500;

/**
 * Pretend to refine the description via an AI service. Resolves to
 * one of the canned variants after a 1500ms delay. The variant choice
 * is deterministic on input length so refreshing on localhost yields
 * the same result for the same input.
 *
 * The chunk-5 contract:
 *   - Always resolves (no rejections from this mock — the SEO panel's
 *     error path is wired but not demoed here).
 *   - The resolved string is shorter than 160 chars, so it lands in
 *     the Optimal verdict band given the aiRefinedAt bump.
 */
export async function refineDescription(current: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, REFINE_LATENCY_MS));
  const len = current?.length ?? 0;
  const idx = len % CANNED_REFINEMENT_TEMPLATES.length;
  return CANNED_REFINEMENT_TEMPLATES[idx];
}
