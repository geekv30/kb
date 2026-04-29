// Shared types for the kb-mcp index modules.
//
// These describe the in-memory shape of the component / token index
// that future MCP tools (issues #9, #10) will consume. They are kept
// intentionally JSON-serialisable: every field is a primitive, an
// array of primitives, or `null` — no TS AST nodes, no functions,
// no Maps inside specs.

/**
 * A single prop on a kb-ui component.
 *
 * `tsType` is a human-readable string (e.g. `"\"primary\" | \"secondary\""`
 * or `"(id: string) => void"`), not a TS AST node — kept stringly so the
 * index is JSON-serialisable and easy to surface through MCP tools.
 */
export type ComponentPropSpec = {
  name: string;
  tsType: string;
  optional: boolean;
  /** JSDoc text attached to the prop, if any (no `*` markers). */
  description: string | null;
};

export type ComponentSpec = {
  /** Component name as exported (e.g. `KBBreadcrumbBar`). */
  name: string;
  /** Folder under `src/components/` (e.g. `nav`, `shell`, `content`). */
  category: string;
  /** Absolute path to the source `.tsx` file. */
  filePath: string;
  /**
   * Single-line description. First sentence of the file's leading
   * comment block, or `null` if no leading comment.
   */
  description: string | null;
  /**
   * Figma reference parsed from the file header
   * (e.g. `9aGp5t9fH1d0PXi4LMhOdb#74:8871`), or `null`.
   */
  figmaNode: string | null;
  /**
   * Props parsed from the component's `Props` type/interface.
   * Empty array if no props type was found OR if extraction threw
   * (the failure is logged to stderr; the spec still ships).
   */
  props: ComponentPropSpec[];
  /**
   * Sibling `.stories.tsx` files (just basenames,
   * e.g. `["SideNavRail.stories.tsx"]`).
   */
  storyFiles: string[];
  /**
   * The recommended import statement,
   * e.g. `import { KBBreadcrumbBar } from '@hiver/kb-ui';`.
   */
  importStatement: string;
};

export type TokenSource = 'css' | 'js';

export type TokenSpec = {
  /**
   * The token's canonical name. For CSS tokens, the variable name with
   * the `--` prefix (e.g. `--color-canvas`). For JS-only tokens (declared
   * in `tokens.ts` but not in CSS), the dotted JS path (e.g.
   * `color.canvas`). If a token exists in both, the CSS form is the
   * canonical key and the `jsTokenPath` field carries the dotted path.
   */
  name: string;
  /** Resolved value (e.g. `#f5f5f5`, `12px`, `Inter, sans-serif`). */
  value: string;
  /**
   * Section comment from `tokens.css` (e.g. `Surfaces`, `Text`,
   * `Spacing`). For JS-only tokens, derived from the top-level
   * `tokens.color.*` namespace. `null` if no group could be inferred.
   */
  category: string | null;
  /**
   * Where the token was found.
   * - `'css'` if CSS-defined, OR if defined in BOTH css and js
   *   (the CSS form is canonical).
   * - `'js'` if only declared in `tokens.ts`.
   */
  source: TokenSource;
  /** Inline comment on the CSS line (e.g. `page/canvas background`), or `null`. */
  description: string | null;
  /** CSS custom property form, present iff the token is in `tokens.css`. */
  cssCustomProperty: string | null;
  /** Dotted JS path, present iff the token is reachable via the `tokens` JS export. */
  jsTokenPath: string | null;
};

export type ComponentIndex = Map<string, ComponentSpec>;
export type TokenIndex = Map<string, TokenSpec>;
