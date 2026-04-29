// Build-time pre-computation of the component / token / stories indices.
//
// Why: at runtime the MCP server can't walk `@test-kb-ui/kb-ui/src/` —
// the published kb-ui tarball only ships `dist/`. So we run the indexers
// here, while the workspace install IS available, and serialise the
// results to JSON in `packages/kb-mcp/dist/`. The runtime loaders
// (`loadComponentIndex` etc.) just JSON.parse those files. Issue #28.
//
// This script is invoked from `package.json`'s `build` script via tsx,
// so it runs as TypeScript and can import the indexer modules directly.

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildComponentIndex, serializeComponentIndex } from '../src/index/component-index.ts';
import { buildTokenIndex, serializeTokenIndex } from '../src/index/token-index.ts';
import { buildStoriesIndex, serializeStoriesIndex } from '../src/index/stories-index.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
// scripts/ → packages/kb-mcp → packages → repo
const PKG_ROOT = resolve(HERE, '..');
const KB_UI_SRC = resolve(PKG_ROOT, '..', 'kb-ui', 'src');
const DIST = resolve(PKG_ROOT, 'dist');

if (!existsSync(KB_UI_SRC)) {
  // eslint-disable-next-line no-console
  console.error(`[build-indices] kb-ui src not found at ${KB_UI_SRC}.`);
  process.exit(1);
}

mkdirSync(DIST, { recursive: true });

// eslint-disable-next-line no-console
console.log('[build-indices] building component index from', KB_UI_SRC);
const components = buildComponentIndex(KB_UI_SRC);
writeFileSync(
  resolve(DIST, 'component-index.json'),
  JSON.stringify(serializeComponentIndex(components), null, 2),
  'utf8',
);
// eslint-disable-next-line no-console
console.log(`[build-indices] wrote ${components.size} components to dist/component-index.json`);

// eslint-disable-next-line no-console
console.log('[build-indices] building token index');
const tokens = buildTokenIndex(KB_UI_SRC);
writeFileSync(
  resolve(DIST, 'token-index.json'),
  JSON.stringify(serializeTokenIndex(tokens), null, 2),
  'utf8',
);
// eslint-disable-next-line no-console
console.log(`[build-indices] wrote ${tokens.size} tokens to dist/token-index.json`);

// eslint-disable-next-line no-console
console.log('[build-indices] building stories index');
const stories = buildStoriesIndex(KB_UI_SRC);
writeFileSync(
  resolve(DIST, 'stories-index.json'),
  JSON.stringify(serializeStoriesIndex(stories), null, 2),
  'utf8',
);
// eslint-disable-next-line no-console
console.log(`[build-indices] wrote ${stories.size} stories to dist/stories-index.json`);

// Bundle product context docs (Phase 11).
const PRODUCT_SRC = resolve(PKG_ROOT, 'product');
const PRODUCT_DIST = resolve(DIST, 'product');
mkdirSync(PRODUCT_DIST, { recursive: true });
for (const name of ['journeys.md', 'information-architecture.md', 'feature-map.md']) {
  const src = resolve(PRODUCT_SRC, name);
  if (!existsSync(src)) {
    console.error(`[build-indices] missing ${src}`);
    process.exit(1);
  }
  writeFileSync(resolve(PRODUCT_DIST, name), readFileSync(src, 'utf8'), 'utf8');
}
console.log('[build-indices] bundled 3 product docs to dist/product/');
