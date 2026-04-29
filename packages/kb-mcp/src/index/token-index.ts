// Parses kb-ui's design tokens from BOTH `tokens.css` and `tokens.ts`,
// merges them by value-equality, and returns a `Map<string, TokenSpec>`
// keyed by canonical token name (CSS form preferred when both exist).
//
// Used by future MCP tools (issues #9, #10) to resolve token names,
// list available tokens by category, and surface inline documentation.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import type { TokenIndex, TokenSpec } from './types.js';

const require = createRequire(import.meta.url);

/* ─────────────────────────────────────────────────────────────
 * kb-ui source resolution
 * ───────────────────────────────────────────────────────────── */

function resolveKbUiSrc(): string {
  // Resolve through the package's main entry, then walk up to the package
  // root. We can't `require.resolve('@test-kb-ui/kb-ui/package.json')` directly
  // because kb-ui's `exports` map doesn't expose `./package.json`.
  const mainEntry = require.resolve('@test-kb-ui/kb-ui');
  let root = dirname(mainEntry);
  for (let i = 0; i < 5; i += 1) {
    if (existsSync(resolve(root, 'package.json'))) break;
    root = dirname(root);
  }
  const src = resolve(root, 'src');
  if (!existsSync(src)) {
    throw new Error(
      `kb-ui source files not found at ${src} — kb-mcp currently requires the workspace install of @test-kb-ui/kb-ui (issue #8 scope). Production support tracked separately.`,
    );
  }
  return src;
}

/* ─────────────────────────────────────────────────────────────
 * tokens.css parser
 * ───────────────────────────────────────────────────────────── */

/**
 * Section-header pattern: `/​* ── Section Name ── *​/` with variable
 * trailing dashes (and either ASCII `-`, en-dash, or em-dash).
 *
 * We match anything between a leading dash run and an optional trailing
 * dash run, ignoring whitespace.
 */
const SECTION_HEADER_RE = /\/\*\s*[─\-—]+\s*([^─\-—*][^*]*?)\s*[─\-—]*\s*\*\//;

/**
 * Token line pattern: `--name: value;` optionally followed by `/* description *​/`.
 */
const TOKEN_LINE_RE = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);\s*(?:\/\*\s*(.+?)\s*\*\/)?/i;

export function parseTokensCss(filePath: string): TokenSpec[] {
  const source = readFileSync(filePath, 'utf8');
  const lines = source.split('\n');

  const out: TokenSpec[] = [];
  // Track tokens we've already seen so a duplicate from the second
  // (`@theme`) block doesn't overwrite the description from `:root`.
  const seen = new Set<string>();

  let currentSection: string | null = null;

  for (const rawLine of lines) {
    // Section header? Capture name and continue (don't try to parse as token).
    const sectionMatch = rawLine.match(SECTION_HEADER_RE);
    if (sectionMatch) {
      const name = sectionMatch[1]
        .trim()
        // Strip stray leading/trailing dash runs that survived the regex.
        .replace(/^[─\-—\s]+|[─\-—\s]+$/g, '');
      if (name) currentSection = name;
      continue;
    }

    // Token line?
    const tokenMatch = rawLine.match(TOKEN_LINE_RE);
    if (tokenMatch) {
      const name = tokenMatch[1];
      const value = tokenMatch[2].trim();
      const description = tokenMatch[3]?.trim() ?? null;
      if (seen.has(name)) continue;
      seen.add(name);
      out.push({
        name,
        value,
        category: currentSection,
        source: 'css',
        description,
        cssCustomProperty: name,
        jsTokenPath: null,
      });
    }
  }

  return out;
}

/* ─────────────────────────────────────────────────────────────
 * tokens.ts parser (TypeScript AST)
 * ───────────────────────────────────────────────────────────── */

type JsLeaf = {
  /** Dotted path, e.g. `color.canvas`. */
  path: string;
  /** Top-level segment, e.g. `color`. */
  topLevel: string;
  /** String form of the literal value. */
  value: string;
};

function flattenObjectLiteral(
  obj: ts.ObjectLiteralExpression,
  prefix: string[],
  topLevel: string,
  out: JsLeaf[],
  warnings: string[],
): void {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) {
      // Skip shorthand / spread / methods — none of those appear in tokens.ts
      // today, but log if the file changes.
      warnings.push(`unsupported property kind at ${prefix.join('.')}: ${ts.SyntaxKind[prop.kind]}`);
      continue;
    }

    let key: string;
    if (ts.isIdentifier(prop.name)) {
      key = prop.name.text;
    } else if (ts.isStringLiteral(prop.name) || ts.isNoSubstitutionTemplateLiteral(prop.name)) {
      key = prop.name.text;
    } else {
      warnings.push(`unsupported key kind at ${prefix.join('.')}`);
      continue;
    }

    const newPath = [...prefix, key];
    const newTopLevel = topLevel || key;
    const init = prop.initializer;

    if (ts.isObjectLiteralExpression(init)) {
      flattenObjectLiteral(init, newPath, newTopLevel, out, warnings);
      continue;
    }

    let value: string | null = null;
    if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
      value = init.text;
    } else if (ts.isNumericLiteral(init)) {
      value = init.text;
    } else if (
      init.kind === ts.SyntaxKind.TrueKeyword ||
      init.kind === ts.SyntaxKind.FalseKeyword
    ) {
      value = init.getText();
    } else {
      warnings.push(`non-literal value at ${newPath.join('.')}: ${ts.SyntaxKind[init.kind]}`);
      continue;
    }

    out.push({
      path: newPath.join('.'),
      topLevel: newTopLevel,
      value,
    });
  }
}

export function parseTokensTs(filePath: string): TokenSpec[] {
  const source = readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.ES2020,
    /* setParentNodes */ true,
    ts.ScriptKind.TS,
  );

  // Locate `export const tokens = { ... }` (also accept a bare `as const`).
  let tokensInit: ts.ObjectLiteralExpression | null = null;
  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExport = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExport) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (
        ts.isIdentifier(decl.name) &&
        decl.name.text === 'tokens' &&
        decl.initializer
      ) {
        let init = decl.initializer;
        // `tokens = { ... } as const` wraps the literal in a TypeAssertion /
        // AsExpression — unwrap.
        while (ts.isAsExpression(init) || ts.isTypeAssertionExpression(init)) {
          init = init.expression;
        }
        if (ts.isObjectLiteralExpression(init)) {
          tokensInit = init;
        }
        break;
      }
    }
    if (tokensInit) break;
  }

  if (!tokensInit) return [];

  const leaves: JsLeaf[] = [];
  const warnings: string[] = [];
  flattenObjectLiteral(tokensInit, [], '', leaves, warnings);

  if (warnings.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[kb-mcp] tokens.ts parse warnings: ${warnings.join('; ')}`);
  }

  return leaves.map<TokenSpec>((leaf) => ({
    name: leaf.path,
    value: leaf.value,
    category: leaf.topLevel,
    source: 'js',
    description: null,
    cssCustomProperty: null,
    jsTokenPath: leaf.path,
  }));
}

/* ─────────────────────────────────────────────────────────────
 * Merge: CSS is canonical, JS leaves backfill `jsTokenPath`
 * ───────────────────────────────────────────────────────────── */

/**
 * Convert a dotted JS path (e.g. `color.aiAddition`) to its CSS-conventional
 * twin name (e.g. `--color-ai-addition`). Used as a tie-breaker when several
 * CSS tokens share the same value — we want `color.aiAddition` to bind to
 * `--color-ai-addition`, not the first-encountered `--color-success-text`
 * that happens to have the same hex.
 */
function jsPathToCssName(path: string): string {
  const kebab = path
    .replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`)
    .replace(/\./g, '-');
  return `--${kebab}`;
}

/**
 * Tokens are matched on **value equality** after trimming, with a preferred
 * tie-breaker: when several CSS tokens share the same value, prefer the one
 * whose name matches the JS path's kebab-cased form (e.g.
 * `color.aiAddition` → `--color-ai-addition`). This avoids the trap where
 * `color.aiAddition` (#086e3f) would otherwise collapse onto
 * `--color-success-text` (also #086e3f) just because it appeared first.
 *
 * If a JS path has no matching CSS twin, it's kept as a `'js'`-source entry
 * under its dotted-path key so none of the dotted paths are silently dropped.
 */
function mergeTokens(cssTokens: TokenSpec[], jsTokens: TokenSpec[]): TokenIndex {
  const index: TokenIndex = new Map();

  // Seed with CSS tokens (canonical).
  for (const css of cssTokens) {
    index.set(css.name, { ...css });
  }

  // Build value -> [css names...] for fast matching with a tie-breaker.
  const cssByValue = new Map<string, string[]>();
  for (const css of cssTokens) {
    const key = css.value.trim();
    const list = cssByValue.get(key);
    if (list) list.push(css.name);
    else cssByValue.set(key, [css.name]);
  }

  // Track which CSS tokens already absorbed a JS path so duplicate JS
  // entries with the same value don't all collapse onto one CSS token.
  const cssAbsorbed = new Set<string>();

  for (const js of jsTokens) {
    const matchKey = js.value.trim();
    const candidates = cssByValue.get(matchKey) ?? [];
    const preferred = jsPathToCssName(js.name);

    // Tie-break: pick the CSS token whose name matches the kebab-cased JS
    // path; otherwise fall back to the first unabsorbed candidate.
    let chosen: string | null = null;
    if (candidates.includes(preferred) && !cssAbsorbed.has(preferred)) {
      chosen = preferred;
    } else {
      for (const candidate of candidates) {
        if (!cssAbsorbed.has(candidate)) {
          chosen = candidate;
          break;
        }
      }
    }

    if (chosen) {
      const existing = index.get(chosen);
      if (existing) existing.jsTokenPath = js.jsTokenPath;
      cssAbsorbed.add(chosen);
      continue;
    }

    // No CSS twin — keep as JS-only entry under its dotted path.
    if (!index.has(js.name)) {
      index.set(js.name, { ...js });
    }
  }

  return index;
}

/* ─────────────────────────────────────────────────────────────
 * Public API
 * ───────────────────────────────────────────────────────────── */

export function buildTokenIndex(): TokenIndex {
  const kbUiSrc = resolveKbUiSrc();
  const cssPath = resolve(kbUiSrc, 'tokens.css');
  const tsPath = resolve(kbUiSrc, 'tokens.ts');

  if (!existsSync(cssPath)) {
    throw new Error(`kb-ui tokens.css not found at ${cssPath}`);
  }
  if (!existsSync(tsPath)) {
    throw new Error(`kb-ui tokens.ts not found at ${tsPath}`);
  }

  const cssTokens = parseTokensCss(cssPath);
  const jsTokens = parseTokensTs(tsPath);
  return mergeTokens(cssTokens, jsTokens);
}
