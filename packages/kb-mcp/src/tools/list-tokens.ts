// MCP tool: list_tokens
//
// Returns every design token, optionally filtered by category
// (the section header from tokens.css, e.g. "Surfaces", "Text", "Spacing").
// Filter is case-insensitive.

import { z } from 'zod';
import type { TokenIndex } from '../index/types.js';

export const listTokensInputSchema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      'Filter by category (section in tokens.css, e.g. "Surfaces", "Text", "Spacing"). Omit to return all. Case-insensitive.',
    ),
});

export type ListTokensInput = z.infer<typeof listTokensInputSchema>;

export type ListTokensOutputEntry = {
  name: string;
  value: string;
  category: string | null;
};

export function listTokens(
  index: TokenIndex,
  input: ListTokensInput,
): ListTokensOutputEntry[] {
  const filter = input.category?.toLowerCase();
  return Array.from(index.values())
    .filter((t) => !filter || t.category?.toLowerCase() === filter)
    .map((t) => ({ name: t.name, value: t.value, category: t.category }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
