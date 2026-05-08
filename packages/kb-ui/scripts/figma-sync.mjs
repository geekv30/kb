/**
 * figma-sync — refresh design/screenshots/*.png from Figma source.
 *
 * Reads `figmaNode` exports from packages/kb-ui/src/**\/*.figma.ts,
 * batch-fetches PNGs from the Figma REST API, writes them to design/screenshots.
 *
 * Usage:
 *   FIGMA_TOKEN=figd_... npm run figma:sync
 *
 * To add a new component to sync:
 *   1. Create a `<Component>.figma.ts` file alongside the component
 *   2. Export a `figmaNode` constant with { fileKey, nodeId, screenshotName }
 *   3. Run `npm run figma:sync`
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..');
// scripts/ → kb-ui → packages → repo root
const REPO_ROOT = resolve(SCRIPT_DIR, '..', '..', '..');
const REVIEW_GLOB_ROOT = resolve(REPO_ROOT, 'packages', 'kb-ui', 'src');
const SCREENSHOTS_DIR = resolve(REPO_ROOT, 'design', 'screenshots');

/** Recursively walk a directory, returning absolute paths matching `predicate`. */
async function walk(dir, predicate, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and dotfile dirs
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      await walk(full, predicate, acc);
    } else if (entry.isFile() && predicate(full)) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * Parse `export const figmaNode = { ... } as const;` from a source file.
 * Returns { fileKey, nodeId, screenshotName } or null when the export is
 * absent or malformed.
 *
 * Approach: regex on the raw source. The constant has a fixed shape — three
 * string fields with single-quoted values — so this is robust enough without
 * pulling in a TS AST.
 */
function parseFigmaNode(source) {
  // Match the export block: handles single/double quotes, optional trailing
  // comma, optional `as const`, and arbitrary key order.
  const blockMatch = source.match(
    /export\s+const\s+figmaNode\s*=\s*\{([\s\S]*?)\}\s*(?:as\s+const)?\s*;?/,
  );
  if (!blockMatch) return null;
  const body = blockMatch[1];

  const pick = (key) => {
    const m = body.match(
      new RegExp(`${key}\\s*:\\s*(['\"\`])([^'\"\`]+)\\1`),
    );
    return m ? m[2] : null;
  };

  const fileKey = pick('fileKey');
  const nodeId = pick('nodeId');
  const screenshotName = pick('screenshotName');

  if (!fileKey || !nodeId || !screenshotName) return null;
  return { fileKey, nodeId, screenshotName };
}

function exitWithMissingToken() {
  process.stderr.write(
    'Missing FIGMA_TOKEN. Create one at https://www.figma.com/settings → Personal access tokens, then re-run with FIGMA_TOKEN=... npm run figma:sync\n',
  );
  process.exit(1);
}

async function main() {
  const token = process.env.FIGMA_TOKEN;
  if (!token) exitWithMissingToken();

  // 1. Find all *.figma.ts files
  const files = await walk(REVIEW_GLOB_ROOT, (p) =>
    p.endsWith('.figma.ts'),
  );

  // 2. Parse figmaNode from each file
  /** @type {Array<{ file: string; fileKey: string; nodeId: string; screenshotName: string }>} */
  const entries = [];
  /** @type {Array<{ file: string; reason: string }>} */
  const parseFailures = [];
  const seenScreenshotNames = new Map(); // screenshotName -> first file

  for (const file of files) {
    const src = await readFile(file, 'utf8');
    const parsed = parseFigmaNode(src);
    const rel = relative(REPO_ROOT, file);
    if (!parsed) {
      parseFailures.push({
        file: rel,
        reason: 'no `export const figmaNode = { fileKey, nodeId, screenshotName }` found',
      });
      continue;
    }
    const dupe = seenScreenshotNames.get(parsed.screenshotName);
    if (dupe) {
      parseFailures.push({
        file: rel,
        reason: `duplicate screenshotName '${parsed.screenshotName}' (also defined in ${dupe})`,
      });
      continue;
    }
    seenScreenshotNames.set(parsed.screenshotName, rel);
    entries.push({ file: rel, ...parsed });
  }

  if (entries.length === 0 && parseFailures.length === 0) {
    process.stdout.write(
      'No *.figma.ts files with a `figmaNode` export were found. Nothing to sync.\n',
    );
    process.exit(0);
  }

  // 3. Group by fileKey for batched API calls
  /** @type {Map<string, typeof entries>} */
  const byFileKey = new Map();
  for (const entry of entries) {
    const list = byFileKey.get(entry.fileKey);
    if (list) list.push(entry);
    else byFileKey.set(entry.fileKey, [entry]);
  }

  /** @type {Array<{ entry: typeof entries[number]; ok: boolean; reason?: string }>} */
  const results = [];

  // 4. For each fileKey group, call /v1/images
  for (const [fileKey, group] of byFileKey) {
    const ids = group.map((e) => e.nodeId).join(',');
    const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(
      ids,
    )}&format=png&scale=2`;

    let imagesByNodeId = null;
    let groupFailureReason = null;
    try {
      const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        groupFailureReason = `Figma API ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ''}`;
      } else {
        const json = await res.json();
        if (json && json.err) {
          groupFailureReason = `Figma API error: ${json.err}`;
        } else if (!json || !json.images) {
          groupFailureReason = 'Figma API returned no `images` map';
        } else {
          imagesByNodeId = json.images;
        }
      }
    } catch (err) {
      groupFailureReason = `network error: ${err && err.message ? err.message : String(err)}`;
    }

    if (!imagesByNodeId) {
      // Whole group failed — mark every entry as failed
      for (const entry of group) {
        results.push({ entry, ok: false, reason: groupFailureReason });
      }
      continue;
    }

    // 5. Download each image to design/screenshots/<screenshotName>.png
    for (const entry of group) {
      const cdnUrl = imagesByNodeId[entry.nodeId];
      if (!cdnUrl) {
        results.push({
          entry,
          ok: false,
          reason: `node ${entry.nodeId} not found in Figma response (deleted or wrong file?)`,
        });
        continue;
      }
      try {
        const imgRes = await fetch(cdnUrl);
        if (!imgRes.ok) {
          results.push({
            entry,
            ok: false,
            reason: `download failed: ${imgRes.status} ${imgRes.statusText}`,
          });
          continue;
        }
        const buf = Buffer.from(await imgRes.arrayBuffer());
        // Only write on success — never write zero-byte/error placeholders
        if (buf.length === 0) {
          results.push({
            entry,
            ok: false,
            reason: 'download returned 0 bytes',
          });
          continue;
        }
        const outPath = join(SCREENSHOTS_DIR, `${entry.screenshotName}.png`);
        await writeFile(outPath, buf);
        results.push({ entry, ok: true });
      } catch (err) {
        results.push({
          entry,
          ok: false,
          reason: `download error: ${err && err.message ? err.message : String(err)}`,
        });
      }
    }
  }

  // 6. Print summary
  let okCount = 0;
  let failCount = parseFailures.length;
  for (const r of results) {
    if (r.ok) {
      okCount += 1;
      const out = relative(
        REPO_ROOT,
        join(SCREENSHOTS_DIR, `${r.entry.screenshotName}.png`),
      );
      process.stdout.write(
        `✓ ${r.entry.screenshotName} (${r.entry.nodeId}) -> ${out}\n`,
      );
    } else {
      failCount += 1;
      process.stdout.write(
        `✗ ${r.entry.screenshotName}: ${r.reason}\n`,
      );
    }
  }
  for (const pf of parseFailures) {
    process.stdout.write(`✗ ${pf.file}: ${pf.reason}\n`);
  }

  process.stdout.write(`\nSynced ${okCount}, failed ${failCount}.\n`);
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  process.stderr.write(
    `figma-sync crashed: ${err && err.stack ? err.stack : String(err)}\n`,
  );
  process.exit(1);
});
