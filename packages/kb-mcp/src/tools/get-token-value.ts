// MCP tool: get_token_value
//
// Returns the full TokenSpec for a single named token. Accepts either the
// CSS form (--color-canvas) or the dotted JS path (color.canvas).

import { z } from 'zod';
import type { TokenIndex, TokenSpec } from '../index/types.js';

export const getTokenValueInputSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe(
      'Token name. Either CSS form ("--color-canvas") or dotted JS path ("color.canvas").',
    ),
});

export type GetTokenValueInput = z.infer<typeof getTokenValueInputSchema>;

export function getTokenValue(
  index: TokenIndex,
  input: GetTokenValueInput,
): TokenSpec {
  // Direct hit on the canonical key (CSS form is canonical when available).
  const direct = index.get(input.name);
  if (direct) return direct;

  // Try the JS-path side: scan for a TokenSpec whose `jsTokenPath` matches.
  for (const t of index.values()) {
    if (t.jsTokenPath === input.name) return t;
  }

  throw new Error(
    `Token "${input.name}" not found. Try either CSS form (e.g. "--color-canvas") or dotted JS path (e.g. "color.canvas").`,
  );
}
