// MCP resource: kb://design/overview
//
// Serves the full text of design.md so Claude can ground itself in the
// design-system foundations without an extra tool round-trip.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const DESIGN_OVERVIEW_URI = 'kb://design/overview';
export const DESIGN_OVERVIEW_NAME = 'Design system overview';
export const DESIGN_OVERVIEW_MIME = 'text/markdown';

export async function readDesignOverview(
  repoRoot: string,
): Promise<{ uri: string; mimeType: string; text: string }> {
  const path = resolve(repoRoot, 'design.md');
  const text = await readFile(path, 'utf8');
  return { uri: DESIGN_OVERVIEW_URI, mimeType: DESIGN_OVERVIEW_MIME, text };
}
