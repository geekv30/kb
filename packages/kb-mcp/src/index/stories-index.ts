// Pre-loaded index of every kb-ui Storybook source file, keyed by
// `meta.title`. At BUILD time we walk `kbUiSrcRoot/**/*.stories.tsx` and
// serialise the result to `dist/stories-index.json`; at RUNTIME the MCP
// server loads the JSON. This is what lets `get_story_code` and the
// pattern picker in `recommend_components_for_prd` work in non-workspace
// (npm) installs, where kb-ui ships only `dist/`. See issue #28.
//
// Two entry points:
//   - `buildStoriesIndex(kbUiSrcRoot)`: pure indexer — recursive readdir
//     for every `*.stories.tsx`, parse the first `title:` literal, keep
//     full source. Used at build time.
//   - `loadStoriesIndex()`: runtime loader — reads pre-built JSON from
//     `dist/`.
//
// Pattern (page-level) stories vs component stories are distinguished by
// whether their relative path lives under `pages/`. Pattern stories are
// the ones the PRD recommender ranks against; component stories are
// surfaced by `get_story_code` for any title match.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export type StoryEntry = {
  /** `meta.title` literal, e.g. `"Patterns/Knowledge Base/Category Page"`. */
  title: string;
  /**
   * Path to the source file. Absolute when built from a workspace install
   * (and used by tests / dev), or kb-ui-src-relative (e.g.
   * `pages/KBCategoryPage.stories.tsx`) when loaded from the bundled JSON.
   * Either form is fine for callers that just want the source — the
   * `source` field is always self-contained.
   */
  filePath: string;
  /** kb-ui-src-relative path, used to distinguish pages/ from components/. */
  relativePath: string;
  /** Full source of the `.stories.tsx` file. */
  source: string;
};

export type StoriesIndex = Map<string, StoryEntry>;

/* ─────────────────────────────────────────────────────────────
 * Build-time
 * ───────────────────────────────────────────────────────────── */

function walkStoryFiles(dir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = resolve(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      out.push(...walkStoryFiles(full));
    } else if (stat.isFile() && entry.endsWith('.stories.tsx')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Extract `meta.title` from a CSF v3 stories file. Strategy:
 *
 *   1. Find a top-level `const meta` declaration (with or without a
 *      `Meta<>` type annotation).
 *   2. Take the substring from there to the first `;` at column 0 — that
 *      is the meta object literal.
 *   3. Extract the first `title: '...'` inside that range.
 *
 * Falls back to the first `title:` literal in the file (legacy behaviour)
 * only if the structured search fails. This avoids false positives from
 * fixture-data arrays that have their own `title:` keys, which is
 * common in kb-ui's pattern stories (e.g. nav item lists).
 */
function extractStoryTitle(source: string): string | null {
  // Match `const meta = ...` or `const meta: Meta<...> = ...`. Anchor on
  // word boundary so we don't pick up `metadata` or similar.
  const metaIdx = source.search(/\bconst\s+meta\b\s*[:=]/);
  if (metaIdx >= 0) {
    // Slice from the meta declaration to a closing `};` at line start
    // (CSF convention) — bounded so we don't accidentally swallow the
    // whole file if the meta block isn't terminated as expected.
    const tail = source.slice(metaIdx);
    const end = tail.search(/^\};/m);
    const metaBlock = end > 0 ? tail.slice(0, end) : tail.slice(0, 4000);
    const match = metaBlock.match(/title\s*:\s*['"`]([^'"`]+)['"`]/);
    if (match) return match[1];
  }
  // Fallback: file-wide first `title:` literal.
  const fallback = source.match(/title\s*:\s*['"`]([^'"`]+)['"`]/);
  return fallback ? fallback[1] : null;
}

/**
 * Walk every `.stories.tsx` under `kbUiSrcRoot`, extract `meta.title`,
 * and return a Map keyed by title. Files without a `title:` literal are
 * skipped (Storybook config files like `Welcome.stories.tsx` may or may
 * not declare one). Title collisions log a warning and keep the first.
 */
export function buildStoriesIndex(kbUiSrcRoot: string): StoriesIndex {
  if (!existsSync(kbUiSrcRoot)) {
    throw new Error(
      `kb-ui src root not found at ${kbUiSrcRoot} — buildStoriesIndex requires a workspace install.`,
    );
  }
  const files = walkStoryFiles(kbUiSrcRoot);
  const index: StoriesIndex = new Map();
  for (const filePath of files) {
    const source = readFileSync(filePath, 'utf8');
    const title = extractStoryTitle(source);
    if (!title) continue;
    if (index.has(title)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[kb-mcp] duplicate story title "${title}" — keeping ${index.get(title)?.filePath}, skipping ${filePath}`,
      );
      continue;
    }
    const rel = relative(kbUiSrcRoot, filePath).split(sep).join('/');
    index.set(title, {
      title,
      filePath,
      relativePath: rel,
      source,
    });
  }
  return index;
}

/**
 * JSON-serialisable form: plain object keyed by title. The build script
 * passes this to `JSON.stringify` directly.
 */
export function serializeStoriesIndex(
  index: StoriesIndex,
): Record<string, StoryEntry> {
  return Object.fromEntries(index);
}

/* ─────────────────────────────────────────────────────────────
 * Runtime
 * ───────────────────────────────────────────────────────────── */

/**
 * Runtime loader: read pre-built `stories-index.json` from `dist/`.
 * Same dual-location probe pattern as the component / token loaders —
 * `import.meta.url` resolves differently depending on which entry the
 * code was bundled into.
 */
export function loadStoriesIndex(): StoriesIndex {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, 'stories-index.json'),
    resolve(here, '..', 'stories-index.json'),
  ];
  let jsonPath: string | null = null;
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      jsonPath = candidate;
      break;
    }
  }
  if (!jsonPath) {
    throw new Error(
      `kb-mcp pre-built stories index not found. Looked in: ${candidates.join(', ')}. Run \`npm run --workspace=packages/kb-mcp build\` to generate it.`,
    );
  }
  const raw = readFileSync(jsonPath, 'utf8');
  const obj = JSON.parse(raw) as Record<string, StoryEntry>;
  return new Map(Object.entries(obj));
}

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

/**
 * Filter to just pattern (page-level) stories — those whose source
 * lives under `pages/`. Used by the PRD recommender's pattern picker.
 */
export function listPatternStoryTitles(index: StoriesIndex): string[] {
  const titles: string[] = [];
  for (const entry of index.values()) {
    if (entry.relativePath.startsWith('pages/')) {
      titles.push(entry.title);
    }
  }
  return titles;
}
