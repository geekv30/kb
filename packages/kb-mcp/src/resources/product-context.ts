// MCP resources: kb://product/journeys, kb://product/information-architecture, kb://product/feature-map
//
// Each serves a concise markdown file from `dist/product/` (bundled at
// package build time — see scripts/build-indices.mjs). Claude reads
// these to ground itself in product structure before reaching for
// component-level tools.

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// dist/index.js → resources/product-context.js doesn't exist; tsup bundles
// everything into dist/index.js. So `HERE` is the dist root. Markdown
// files sit alongside in dist/product/.
const PRODUCT_DIR = resolve(HERE, 'product');

export const PRODUCT_MIME = 'text/markdown';

type ProductResource = {
  uri: string;
  name: string;
  description: string;
  filename: string;
};

export const PRODUCT_RESOURCES: ProductResource[] = [
  {
    uri: 'kb://product/journeys',
    name: 'User journeys',
    description:
      'The 3 primary user journeys in Hiver KB (Browse & Edit, AI Optimise Review, Analytics Drill) with personas, entry points, and where new features typically attach. Read this first when scoping a PRD.',
    filename: 'journeys.md',
  },
  {
    uri: 'kb://product/information-architecture',
    name: 'Information architecture',
    description:
      'Sitemap, top-level rail sections, sub-nav per section, full-vs-collapsed shell modes, and per-route component composition. Use to decide WHERE a new feature lands in the product.',
    filename: 'information-architecture.md',
  },
  {
    uri: 'kb://product/feature-map',
    name: 'Feature map',
    description:
      'What the product can do today by capability area, and a list of common asks NOT yet built. Use to decide whether a PRD is net-new, an extension, or a modification.',
    filename: 'feature-map.md',
  },
];

const byUri = new Map(PRODUCT_RESOURCES.map((r) => [r.uri, r]));

export function isProductResourceUri(uri: string): boolean {
  return byUri.has(uri);
}

export async function readProductResource(
  uri: string,
): Promise<{ uri: string; mimeType: string; text: string }> {
  const entry = byUri.get(uri);
  if (!entry) {
    throw new Error(`Unknown product resource URI "${uri}".`);
  }
  const text = await readFile(resolve(PRODUCT_DIR, entry.filename), 'utf8');
  return { uri, mimeType: PRODUCT_MIME, text };
}
