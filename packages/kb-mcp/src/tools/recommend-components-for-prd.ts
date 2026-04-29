// MCP tool: recommend_components_for_prd
//
// Headline retrieval tool for issue #10 / Phase 9.4. Turns a plain-English
// PRD into a starting composition by:
//   1. Scoring every kb-ui component against the PRD using a hand-written
//      keyword index (see ../keywords.ts).
//   2. Finding the closest matching pattern story file in
//      packages/kb-ui/src/pages/*.stories.tsx (by `meta.title`).
//   3. Picking a hand-curated `compositionSnippet` template keyed by the
//      top-2 recommended component names (see ../composition-templates.ts).
//
// Deliberately deterministic: the MCP client (Claude) does the higher-level
// reasoning on top of what this tool returns.

import { z } from 'zod';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ComponentIndex } from '../index/types.js';
import { componentKeywords } from '../keywords.js';
import { compositionTemplates } from '../composition-templates.js';
import { getStoryCode } from './get-story-code.js';

/* ─────────────────────────────────────────────────────────────
 * Schema + types
 * ───────────────────────────────────────────────────────────── */

export const recommendComponentsForPrdInputSchema = z.object({
  prd: z
    .string()
    .min(10)
    .describe(
      'Plain-English description of the feature you want to build (1–3 sentences typical, but longer is fine).',
    ),
});

export type RecommendComponentsForPrdInput = z.infer<
  typeof recommendComponentsForPrdInputSchema
>;

export type RecommendedComponent = {
  name: string;
  category: string;
  why: string;
  importStatement: string;
};

export type SuggestedPattern = {
  storyTitle: string;
  storySource: string;
};

export type RecommendComponentsForPrdOutput = {
  recommendedComponents: RecommendedComponent[];
  suggestedPattern: SuggestedPattern | null;
  compositionSnippet: string;
};

/* ─────────────────────────────────────────────────────────────
 * Tokenization
 * ───────────────────────────────────────────────────────────── */

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'to',
  'of',
  'for',
  'with',
  'that',
  'this',
  'is',
  'are',
  'should',
  'would',
  'and',
  'or',
  'in',
  'on',
  'at',
  'by',
  'as',
  'be',
  'it',
  'its',
]);

/** Lowercase, strip punctuation, split on whitespace, drop stopwords. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

function bigrams(tokens: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    out.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────
 * Scoring
 * ───────────────────────────────────────────────────────────── */

type ComponentScore = {
  name: string;
  score: number;
  matchedKeywords: string[];
};

function countWords(s: string): number {
  return s.trim().split(/\s+/).length;
}

function scoreComponent(
  componentName: string,
  keywords: string[],
  prdLower: string,
  tokens: string[],
  tokenSet: Set<string>,
  bigramSet: Set<string>,
): ComponentScore {
  let score = 0;
  const matched: string[] = [];

  for (const keyword of keywords) {
    const kwLower = keyword.toLowerCase();
    const wordCount = countWords(kwLower);

    if (wordCount === 1) {
      // Single token: case-insensitive substring against tokenized PRD.
      if (tokenSet.has(kwLower)) {
        score += 1;
        matched.push(keyword);
      }
      continue;
    }

    if (wordCount === 2) {
      // Bigram: adjacent tokens OR exact substring in PRD.
      if (bigramSet.has(kwLower) || prdLower.includes(kwLower)) {
        score += 3;
        matched.push(keyword);
      }
      continue;
    }

    // 3+ word phrase: verbatim substring match.
    if (prdLower.includes(kwLower)) {
      score += 5;
      matched.push(keyword);
    }
  }

  // Bonus: component name appears in the PRD (case-insensitive). Captures
  // "I need a DataTable for…" and the like.
  if (tokenSet.has(componentName.toLowerCase())) {
    score += 2;
    if (!matched.includes(componentName)) {
      matched.unshift(componentName);
    }
  }

  // Suppress noise: `tokens` is intentionally unused beyond bigram building,
  // but the parameter keeps the signature aligned with future polish.
  void tokens;

  return { name: componentName, score, matchedKeywords: matched };
}

/* ─────────────────────────────────────────────────────────────
 * Pattern picker
 * ───────────────────────────────────────────────────────────── */

async function listPatternStoryTitles(
  kbUiSrcRoot: string,
): Promise<string[]> {
  const pagesDir = join(kbUiSrcRoot, 'pages');
  let entries: string[] = [];
  try {
    entries = await readdir(pagesDir);
  } catch {
    return [];
  }
  const titles: string[] = [];
  for (const entry of entries) {
    if (!entry.endsWith('.stories.tsx')) continue;
    const source = await readFile(join(pagesDir, entry), 'utf8');
    // First `title:` literal in the file is the meta title.
    const match = source.match(/title\s*:\s*['"`]([^'"`]+)['"`]/);
    if (match) titles.push(match[1]);
  }
  return titles;
}

/** Score a pattern story title using the same tokenization rules. */
function scoreStoryTitle(
  title: string,
  prdLower: string,
  tokenSet: Set<string>,
  bigramSet: Set<string>,
): number {
  // Treat each non-stopword title token as a single-token keyword (+1) and
  // each adjacent pair as a bigram keyword (+3). Verbatim title substring
  // in the PRD scores +5 like a long-phrase keyword would.
  if (prdLower.includes(title.toLowerCase())) return 5;
  const titleTokens = tokenize(title);
  let score = 0;
  for (const t of titleTokens) {
    if (tokenSet.has(t)) score += 1;
  }
  for (const bg of bigrams(titleTokens)) {
    if (bigramSet.has(bg)) score += 3;
  }
  return score;
}

/* ─────────────────────────────────────────────────────────────
 * Composition snippet picker
 * ───────────────────────────────────────────────────────────── */

function pickCompositionSnippet(topComponentNames: string[]): string {
  const top2 = topComponentNames.slice(0, 2);
  for (const tpl of compositionTemplates) {
    if (tpl.primaryFor.length === 0) continue; // generic-page is fallback
    if (tpl.primaryFor.some((c) => top2.includes(c))) {
      return tpl.snippet;
    }
  }
  const generic = compositionTemplates.find((t) => t.id === 'generic-page');
  if (!generic) {
    throw new Error(
      'Composition templates list is missing the "generic-page" fallback entry.',
    );
  }
  return generic.snippet;
}

/* ─────────────────────────────────────────────────────────────
 * Public entrypoint
 * ───────────────────────────────────────────────────────────── */

/**
 * Score every component, fetch the best matching pattern story (if any),
 * and assemble a composition snippet.
 *
 * `kbUiSrcRoot` is optional for unit tests — when omitted the function
 * skips the pattern lookup and returns `suggestedPattern: null`. The MCP
 * server entrypoint always passes the resolved kb-ui src root.
 */
export async function recommendComponentsForPrd(
  index: ComponentIndex,
  input: RecommendComponentsForPrdInput,
  options: { kbUiSrcRoot?: string } = {},
): Promise<RecommendComponentsForPrdOutput> {
  const prd = input.prd;
  const prdLower = prd.toLowerCase();
  const tokens = tokenize(prd);
  const tokenSet = new Set(tokens);
  const bigramSet = new Set(bigrams(tokens));

  /* ── 1. Score components ─────────────────────────────────── */
  const scores: ComponentScore[] = [];
  for (const [name, keywords] of Object.entries(componentKeywords)) {
    const score = scoreComponent(
      name,
      keywords,
      prdLower,
      tokens,
      tokenSet,
      bigramSet,
    );
    if (score.score > 0) scores.push(score);
  }

  // Sort by score desc, tie-break alphabetically for determinism.
  scores.sort((a, b) =>
    b.score - a.score || a.name.localeCompare(b.name),
  );

  const top = scores.slice(0, 7);

  // AppShell is page chrome — its keywords ("layout", "shell", etc.) rarely
  // appear in feature-level PRDs, so the keyword scorer misses it even when
  // a page-level content component is clearly in scope. Co-recommend it.
  const PAGE_LEVEL_TRIGGERS = [
    'ContentEditor',
    'ArticleBody',
    'AnalyticsAreaChart',
    'AnalyticsDonutChart',
    'AnalyticsChartCard',
    'ArticlesTable',
    'SubCategoriesTable',
    'AIGapSuggestionCard',
    'AISuggestionsCard',
    'KBBreadcrumbBar',
    'PageHeader',
    'StatCardGrid',
    'DataTable',
  ];
  const hasAppShell = top.some((s) => s.name === 'AppShell');
  const trigger = top.find((s) => PAGE_LEVEL_TRIGGERS.includes(s.name));
  if (!hasAppShell && trigger) {
    top.unshift({
      name: 'AppShell',
      score: 0,
      matchedKeywords: [`Page chrome — co-recommended with ${trigger.name}`],
    });
    if (top.length > 7) top.length = 7;
  }

  const recommendedComponents: RecommendedComponent[] = top.map((s) => {
    const spec = index.get(s.name);
    const matchedPreview = s.matchedKeywords.slice(0, 3);
    const why =
      matchedPreview.length > 0
        ? `Matched: ${matchedPreview.map((k) => `"${k}"`).join(', ')}`
        : 'Matched on component name';
    return {
      name: s.name,
      category: spec?.category ?? 'unknown',
      why,
      importStatement:
        spec?.importStatement ?? `import { ${s.name} } from '@hiver/kb-ui';`,
    };
  });

  /* ── 2. Pattern picker ───────────────────────────────────── */
  let suggestedPattern: SuggestedPattern | null = null;
  if (options.kbUiSrcRoot) {
    const titles = await listPatternStoryTitles(options.kbUiSrcRoot);
    let best: { title: string; score: number } | null = null;
    for (const title of titles) {
      const titleScore = scoreStoryTitle(title, prdLower, tokenSet, bigramSet);
      if (titleScore <= 0) continue;
      if (!best || titleScore > best.score) best = { title, score: titleScore };
    }
    if (best) {
      const code = await getStoryCode(options.kbUiSrcRoot, {
        storyTitle: best.title,
      });
      suggestedPattern = {
        storyTitle: code.storyTitle,
        storySource: code.source,
      };
    }
  }

  /* ── 3. Composition snippet ──────────────────────────────── */
  const compositionSnippet = pickCompositionSnippet(
    recommendedComponents.map((c) => c.name),
  );

  return {
    recommendedComponents,
    suggestedPattern,
    compositionSnippet,
  };
}
