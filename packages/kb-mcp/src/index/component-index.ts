// Walks `@hiver/kb-ui`'s `src/components/**/*.tsx` and builds an in-memory
// index of every canonical component (the file-named export). The result is
// a `Map<string, ComponentSpec>` keyed by component name, ready for future
// MCP tools (issues #9, #10) to query by name, category, or Figma node.
//
// Scope notes:
// - Targets the WORKSPACE install of `@hiver/kb-ui` (the `node_modules`
//   symlink to `packages/kb-ui/`). Production tarballs only ship `dist/`,
//   so this throws a clear error in that mode — handling that case is a
//   separate, post-#6 polish step.
// - One file = one canonical component. Helper exports in the same file
//   are intentionally not indexed; only the export whose name matches the
//   filename is returned.
// - Prop extraction uses the TypeScript compiler API. If a single file
//   fails to parse, that component ships with `props: []` and a stderr
//   warning; the rest of the index still builds.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, basename, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import type { ComponentIndex, ComponentPropSpec, ComponentSpec } from './types.js';

const require = createRequire(import.meta.url);

/* ─────────────────────────────────────────────────────────────
 * kb-ui source resolution
 * ───────────────────────────────────────────────────────────── */

function resolveKbUiSrc(): string {
  // Resolve through the package's main entry, then walk up to the package
  // root. We can't `require.resolve('@hiver/kb-ui/package.json')` directly
  // because kb-ui's `exports` map doesn't expose `./package.json`.
  const mainEntry = require.resolve('@hiver/kb-ui');
  // mainEntry => `.../node_modules/@hiver/kb-ui/dist/index.js` (or .mjs).
  // The package root is the parent of `dist/`.
  let root = dirname(mainEntry);
  // Walk up until we find a directory containing `package.json`.
  for (let i = 0; i < 5; i += 1) {
    if (existsSync(resolve(root, 'package.json'))) break;
    root = dirname(root);
  }
  const src = resolve(root, 'src');
  if (!existsSync(src)) {
    throw new Error(
      `kb-ui source files not found at ${src} — kb-mcp currently requires the workspace install of @hiver/kb-ui (issue #8 scope). Production support tracked separately.`,
    );
  }
  return src;
}

/* ─────────────────────────────────────────────────────────────
 * Filesystem walking
 * ───────────────────────────────────────────────────────────── */

type ComponentFile = {
  filePath: string;
  componentName: string;
  category: string;
};

function walkComponents(componentsDir: string): ComponentFile[] {
  const out: ComponentFile[] = [];
  const categories = readdirSync(componentsDir).filter((entry) => {
    return statSync(resolve(componentsDir, entry)).isDirectory();
  });
  for (const category of categories) {
    const dir = resolve(componentsDir, category);
    for (const fileName of readdirSync(dir)) {
      if (!fileName.endsWith('.tsx')) continue;
      if (fileName.endsWith('.stories.tsx')) continue;
      const componentName = fileName.slice(0, -'.tsx'.length);
      out.push({
        filePath: resolve(dir, fileName),
        componentName,
        category,
      });
    }
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────
 * Header comment + Figma node parsing
 * ───────────────────────────────────────────────────────────── */

/**
 * Extracts the file's "header" comment for the description / Figma node
 * lookup. We accept the first comment block that appears in the file
 * before the first non-comment, non-import statement — kb-ui has three
 * conventions in the wild:
 *
 *   1. `//` line cluster starting at line 1 (e.g. `nav/SideNavRail.tsx`).
 *   2. A `/* ... *​/` block at line 1 (e.g. `content/ArticleBody.tsx`).
 *   3. A `/* ... *​/` or `/​** ... *​/` block sitting BETWEEN imports
 *      and the first `export` (e.g. `content/AICard.tsx`,
 *      `brand/AiIcon.tsx`).
 *
 * Anything inside a function body or after the first export is ignored.
 * Returns the comment contents stripped of comment markers (and JSDoc
 * `*` line decoration), or `null` if no qualifying comment is found.
 */
function readLeadingComment(source: string): string | null {
  const lines = source.split('\n');
  if (lines.length === 0) return null;

  // Case A: `//` line cluster starting at line 1.
  if (lines[0].trimStart().startsWith('//')) {
    const buf: string[] = [];
    for (const raw of lines) {
      const trimmed = raw.trimStart();
      if (trimmed.startsWith('//')) {
        buf.push(trimmed.replace(/^\/\/\s?/, ''));
        continue;
      }
      break;
    }
    if (buf.length > 0) return buf.join('\n');
  }

  // Case B / C: scan forward for the first `/* ... */` block that
  // sits before the first export. This captures both line-1 blocks
  // and post-import blocks like AICard's `/* ─── AICard ─── */`.
  const firstExportIdx = (() => {
    const idx = source.search(/^\s*export\b/m);
    return idx === -1 ? source.length : idx;
  })();

  let cursor = 0;
  while (cursor < firstExportIdx) {
    const start = source.indexOf('/*', cursor);
    if (start === -1 || start >= firstExportIdx) break;
    const end = source.indexOf('*/', start + 2);
    if (end === -1) break;
    const inner = source.slice(start + 2, end);
    const cleaned = inner
      .split('\n')
      .map((l) => l.replace(/^\s*\*\s?/, '').replace(/^\s+/, ''))
      // Drop pure box-drawing decorator lines like `─────────────`.
      .filter((l) => !/^[─\-—*\s]+$/.test(l))
      .join('\n')
      .trim();
    if (cleaned) return cleaned;
    cursor = end + 2;
  }

  return null;
}

/**
 * Find the JSDoc block immediately preceding `export function ${name}` or
 * `export const ${name} =`. Returns the cleaned text or `null`.
 *
 * Used as a fallback for files (e.g. `brand/AiIcon.tsx`) where the prose
 * + Figma reference live on the function instead of at file top.
 */
function readComponentJsDoc(source: string, componentName: string): string | null {
  // Match `export function Name(` or `export const Name =` or
  // `export const Name: <type> =`. We don't need to be exhaustive — the
  // canonical kb-ui pattern is `export function ComponentName(`.
  const declRe = new RegExp(
    `^\\s*export\\s+(?:function|const)\\s+${componentName}\\b`,
    'm',
  );
  const declMatch = declRe.exec(source);
  if (!declMatch) return null;
  const declStart = declMatch.index;

  // Walk backward from the declaration, skipping whitespace, looking for
  // the closing `*/` of a JSDoc block.
  let cursor = declStart - 1;
  while (cursor >= 0 && /\s/.test(source[cursor])) cursor -= 1;
  if (cursor < 1 || source[cursor] !== '/' || source[cursor - 1] !== '*') {
    return null;
  }
  // Found `*/` at `cursor`. Find the matching `/*` opening.
  const openIdx = source.lastIndexOf('/*', cursor - 2);
  if (openIdx === -1) return null;
  // Require a real JSDoc block (`/**`) — not a `/* ----- divider ----- */`
  // pseudo-section break. Avoids picking up the `/* ---- main component ---- */`
  // line that sits above some `export function` declarations in kb-ui.
  if (source[openIdx + 2] !== '*') return null;

  const inner = source.slice(openIdx + 2, cursor - 1);
  const cleaned = inner
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').replace(/^\s+/, ''))
    .filter((l) => !/^[─\-—*\s]+$/.test(l))
    .join('\n')
    .trim();
  return cleaned || null;
}

/**
 * Pull the first Figma reference out of a header comment. Two patterns:
 *   - `Figma: <fileKey>#<nodeId>` (canonical, e.g. content/* and overlays/*)
 *   - `Figma <fileKey> ... node <nodeId>` (older nav/* prose form)
 *
 * Returns `${fileKey}#${nodeId}` or `null`.
 */
function parseFigmaNode(comment: string | null): string | null {
  if (!comment) return null;

  // Canonical short form: `Figma: <fileKey>#<nodeId>` (allow surrounding
  // backticks/whitespace).
  const short = comment.match(/Figma:\s*`?([A-Za-z0-9]{15,})`?\s*#\s*`?(\d+:\d+)`?/);
  if (short) return `${short[1]}#${short[2]}`;

  // Loose form: `Figma <fileKey> ... <nodeId>` — the file key and node id
  // can sit a few words / lines apart in the same comment block (e.g.
  // `brand/AiIcon.tsx` writes `Figma file: <key>` then a few lines later
  // `Vector node: I<NN:NN>;...`). We deliberately stop at a `.` so we
  // don't leak into the next sentence.
  const loose = comment.match(
    /Figma\s+(?:file\s*:?\s*)?`?([A-Za-z0-9]{15,})`?[^.]*?`?(\d+:\d+)`?/is,
  );
  if (loose) return `${loose[1]}#${loose[2]}`;

  return null;
}

/**
 * First sentence of the comment block, capped at 200 chars. Strips JSDoc
 * `*` markers and trims. Returns `null` if no usable text.
 */
function parseDescription(comment: string | null): string | null {
  if (!comment) return null;
  // Drop lines that are obviously metadata-only (Figma refs, file headers).
  const meaningful = comment
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (/^Figma:?\s/.test(t)) return false;
      // skip pure URL/file id lines
      if (/^[A-Za-z0-9]+#\d+:\d+\s*$/.test(t)) return false;
      return true;
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!meaningful) return null;

  // First sentence: up to first period followed by space/end, or 200 chars.
  const sentenceMatch = meaningful.match(/^(.+?[.!?])(\s|$)/);
  const text = (sentenceMatch ? sentenceMatch[1] : meaningful).trim();
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

/* ─────────────────────────────────────────────────────────────
 * Props extraction (TypeScript compiler API)
 * ───────────────────────────────────────────────────────────── */

const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  skipLibCheck: true,
  noEmit: true,
};

/**
 * Walks the AST of a TypeNode and collects the property signatures the
 * AUTHOR wrote — including those reachable through intersections with
 * other LOCAL type aliases in the same file. Crucially, this stops at
 * imported types (e.g. `React.HTMLAttributes<HTMLElement>`), so we don't
 * dump every DOM attribute into the prop list.
 */
function collectAuthoredPropSignatures(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile,
  out: ts.PropertySignature[],
  visited: Set<string>,
): void {
  if (ts.isTypeLiteralNode(typeNode)) {
    for (const member of typeNode.members) {
      if (ts.isPropertySignature(member)) out.push(member);
    }
    return;
  }

  if (ts.isIntersectionTypeNode(typeNode)) {
    for (const sub of typeNode.types) {
      collectAuthoredPropSignatures(sub, sourceFile, out, visited);
    }
    return;
  }

  if (ts.isParenthesizedTypeNode(typeNode)) {
    collectAuthoredPropSignatures(typeNode.type, sourceFile, out, visited);
    return;
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    // Resolve only references to LOCAL aliases/interfaces in the same file.
    const refName = ts.isIdentifier(typeNode.typeName) ? typeNode.typeName.text : null;
    if (!refName) return;
    if (visited.has(refName)) return;
    visited.add(refName);
    for (const stmt of sourceFile.statements) {
      if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === refName) {
        for (const member of stmt.members) {
          if (ts.isPropertySignature(member)) out.push(member);
        }
        // Honour `extends X, Y` clauses on local interfaces.
        if (stmt.heritageClauses) {
          for (const clause of stmt.heritageClauses) {
            for (const heritageType of clause.types) {
              const exprType = heritageType.expression;
              if (ts.isIdentifier(exprType)) {
                const fakeRef = ts.factory.createTypeReferenceNode(exprType.text);
                collectAuthoredPropSignatures(fakeRef, sourceFile, out, visited);
              }
            }
          }
        }
        return;
      }
      if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === refName) {
        collectAuthoredPropSignatures(stmt.type, sourceFile, out, visited);
        return;
      }
    }
    // Reference resolves to an imported / external type (e.g.
    // `React.HTMLAttributes<...>`). Intentionally NOT expanded — those
    // props are passed through via `...rest` and aren't part of the
    // component's documented surface.
    return;
  }
}

/**
 * Extract the props of a component from one source file. Strategy:
 *   1. Find a top-level `${ComponentName}Props` interface or type alias.
 *   2. Failing that, fall back to the component function's first
 *      parameter type annotation.
 *   3. Walk the AUTHOR-written property signatures (no DOM attribute
 *      blow-up from intersected React types).
 *
 * On any thrown error, returns `[]` (caller logs the warning).
 */
function extractPropsForFile(filePath: string, componentName: string): ComponentPropSpec[] {
  const program = ts.createProgram([filePath], COMPILER_OPTIONS);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) return [];

  const targetTypeName = `${componentName}Props`;

  // 1. Find the canonical Props declaration.
  let propsTypeNode: ts.TypeNode | null = null;
  for (const stmt of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === targetTypeName) {
      // Synthesise a type-reference node so the same walker handles it.
      propsTypeNode = ts.factory.createTypeReferenceNode(targetTypeName);
      break;
    }
    if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === targetTypeName) {
      propsTypeNode = stmt.type;
      break;
    }
  }

  // 2. Fallback: parameter type on the component function/const.
  if (!propsTypeNode) {
    for (const stmt of sourceFile.statements) {
      if (ts.isFunctionDeclaration(stmt) && stmt.name?.text === componentName) {
        const param = stmt.parameters[0];
        if (param?.type) propsTypeNode = param.type;
        break;
      }
      if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (
            ts.isIdentifier(decl.name) &&
            decl.name.text === componentName &&
            decl.initializer &&
            (ts.isArrowFunction(decl.initializer) ||
              ts.isFunctionExpression(decl.initializer))
          ) {
            const param = decl.initializer.parameters[0];
            if (param?.type) propsTypeNode = param.type;
            break;
          }
        }
      }
      if (propsTypeNode) break;
    }
  }

  if (!propsTypeNode) return [];

  const propSignatures: ts.PropertySignature[] = [];
  collectAuthoredPropSignatures(propsTypeNode, sourceFile, propSignatures, new Set());

  // De-dupe by name (intersection of two locally-authored types could
  // hypothetically declare the same prop twice — first wins).
  const out: ComponentPropSpec[] = [];
  const seen = new Set<string>();
  for (const sig of propSignatures) {
    if (!sig.name || !ts.isIdentifier(sig.name)) continue;
    const name = sig.name.text;
    if (!name || name.startsWith('__') || seen.has(name)) continue;
    seen.add(name);

    const optional = sig.questionToken !== undefined;

    let tsType = 'unknown';
    if (sig.type) {
      const resolved = checker.getTypeAtLocation(sig.type);
      tsType = checker.typeToString(
        resolved,
        sig,
        ts.TypeFormatFlags.NoTruncation |
          ts.TypeFormatFlags.UseFullyQualifiedType |
          ts.TypeFormatFlags.InTypeAlias,
      );
    }

    // Pull JSDoc directly off the property signature so we get the
    // author's comment regardless of whether the symbol was reachable
    // through an intersection.
    const jsDocs = ts.getJSDocCommentsAndTags(sig);
    let description: string | null = null;
    for (const doc of jsDocs) {
      if (ts.isJSDoc(doc) && doc.comment) {
        description = typeof doc.comment === 'string'
          ? doc.comment.trim()
          : doc.comment.map((c) => ('text' in c ? c.text : '')).join('').trim();
        if (description) break;
      }
    }

    out.push({ name, tsType, optional, description: description || null });
  }

  return out;
}

/* ─────────────────────────────────────────────────────────────
 * Story-file siblings
 * ───────────────────────────────────────────────────────────── */

function findStoryFiles(componentDir: string, componentName: string): string[] {
  const entries = readdirSync(componentDir);
  const out: string[] = [];
  for (const entry of entries) {
    if (!entry.endsWith('.stories.tsx')) continue;
    // Basename match on "${ComponentName}.stories.tsx" — this is the
    // convention across kb-ui and is sufficient for #8 scope.
    if (entry === `${componentName}.stories.tsx`) {
      out.push(entry);
    }
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────
 * Public API
 * ───────────────────────────────────────────────────────────── */

export function buildComponentIndex(): ComponentIndex {
  const kbUiSrc = resolveKbUiSrc();
  const componentsDir = resolve(kbUiSrc, 'components');
  const files = walkComponents(componentsDir);

  const index: ComponentIndex = new Map();

  for (const file of files) {
    let props: ComponentPropSpec[] = [];
    try {
      props = extractPropsForFile(file.filePath, file.componentName);
    } catch (err) {
      // Don't fail the whole index over one bad parse.
      // eslint-disable-next-line no-console
      console.warn(
        `[kb-mcp] Failed to extract props for ${file.componentName} (${file.filePath}): ${(err as Error).message}`,
      );
      props = [];
    }

    let source = '';
    try {
      source = readFileSync(file.filePath, 'utf8');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        `[kb-mcp] Failed to read ${file.filePath}: ${(err as Error).message}`,
      );
    }

    const headerComment = readLeadingComment(source);
    // Fall back to the JSDoc attached to the component function/const
    // declaration itself when the file has no top-of-file comment block
    // (e.g. `brand/AiIcon.tsx`, where the prose lives on the function).
    const componentJsDoc = readComponentJsDoc(source, file.componentName);
    const description = parseDescription(headerComment) ?? parseDescription(componentJsDoc);
    const figmaNode = parseFigmaNode(headerComment) ?? parseFigmaNode(componentJsDoc);
    const storyFiles = findStoryFiles(dirname(file.filePath), file.componentName);

    const spec: ComponentSpec = {
      name: file.componentName,
      category: file.category,
      filePath: file.filePath,
      description,
      figmaNode,
      props,
      storyFiles,
      importStatement: `import { ${file.componentName} } from '@hiver/kb-ui';`,
    };

    index.set(file.componentName, spec);
  }

  return index;
}

// Suppress unused-import warning for `basename`/`sep` if minified — kept here
// in case future polish wants relative-path display (out of scope for #8).
void basename;
void sep;
