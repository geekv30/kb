// MCP tool: find_relevant_journey
//
// Phase 11.5 — given a plain-English PRD, return the existing user journey
// it most likely attaches to, the entry point, the landing page, and a
// short list of components Claude should expect to touch. Hand-curated
// keyword index per journey (similar shape to ../keywords.ts but smaller).
//
// Deterministic + retrieval-based; the MCP client (Claude) does any
// follow-up reasoning. Pairs naturally with the kb://product/* resources:
// once Claude has scoped the journey, it can read the matching markdown
// for full context.

import { z } from 'zod';

export const findRelevantJourneyInputSchema = z.object({
  prd: z
    .string()
    .min(10)
    .describe(
      'Plain-English description of the feature you want to scope (1-3 sentences typical).',
    ),
});

export type FindRelevantJourneyInput = z.infer<
  typeof findRelevantJourneyInputSchema
>;

type Journey = {
  id: string;
  name: string;
  persona: string;
  entryPoint: string;
  landingPage: string;
  keyComponents: string[];
  keywords: string[];
};

const JOURNEYS: Journey[] = [
  {
    id: 'browse-edit',
    name: 'Browse & Edit',
    persona: 'Admin / Content Author',
    entryPoint: 'Rail "Editor" icon -> /kb/...',
    landingPage: 'Category page (/kb/<slug>) -> Editor page (/kb/.../<slug>/edit)',
    keyComponents: [
      'AppShell',
      'SideNavRail',
      'FileExplorerNav',
      'KBBreadcrumbBar',
      'PageHeader',
      'SubCategoriesTable',
      'ArticlesTable',
      'ContentEditor',
      'ArticleSettingsPanel',
    ],
    keywords: [
      'article',
      'articles',
      'editor',
      'edit',
      'edits',
      'editing',
      'category',
      'categories',
      'tree',
      'browse',
      'navigate',
      'create',
      'creation',
      'author',
      'authoring',
      'draft',
      'publish',
      'publishing',
      'tag',
      'tags',
      'metadata',
      'settings panel',
      'article settings',
      'kb',
      'knowledge base',
      'rich text',
      'tiptap',
      'wysiwyg',
      'slug',
      'seo title',
      'visibility',
      'reviewer',
      'reviewers',
      'save',
      'unsaved',
      'breadcrumb',
      'new article',
      'new draft',
    ],
  },
  {
    id: 'ai-optimise',
    name: 'AI Optimise Review',
    persona: 'Admin (reviewer)',
    entryPoint: 'Rail "AI" icon -> /ai-optimise',
    landingPage: 'Hub (/ai-optimise) -> Interactive review (/ai-optimise/<slug>/review)',
    keyComponents: [
      'AppShell',
      'AISubNav',
      'KBBreadcrumbBar',
      'SuggestionCard',
      'ArticleBody',
      'SuggestionBlock',
      'AISuggestionsCard',
      'AIGapSuggestionCard',
      'SourcesSideSheet',
      'ArticleSettingsPanel',
    ],
    keywords: [
      'ai',
      'suggestion',
      'suggestions',
      'recommend',
      'recommendation',
      'review',
      'reviewing',
      'accept',
      'reject',
      'dismiss',
      'undo',
      'inline',
      'addition',
      'replace',
      'removal',
      'gap',
      'gaps',
      'optimise',
      'optimize',
      'optimisation',
      'optimization',
      'sources',
      'source sheet',
      'side sheet',
      'side drawer',
      'drawer',
      'citation',
      'citations',
      'conversation',
      'conversations',
      'reducer',
      'state machine',
      'review flow',
      'highlight',
      'diff',
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Drill',
    persona: 'Admin',
    entryPoint: 'Rail "Analytics" icon -> /analytics/...',
    landingPage:
      'One of 3 tabs: /analytics/article-performance, /analytics/search, /analytics/ai-answer-performance',
    keyComponents: [
      'AppShell',
      'FileExplorerNav',
      'PageHeader',
      'DateRangePill',
      'StatCard',
      'StatCardGrid',
      'AnalyticsAreaChart',
      'AnalyticsDonutChart',
      'AnalyticsChartCard',
      'Card',
      'HelpfulnessTag',
      'ArticlesNeedsAttentionTable',
      'ArticlePerformanceTable',
      'SearchKeywordsTable',
      'ContentGapsTable',
      'AIConversationLogEntry',
      'AIConversationLogsCard',
      'MostCitedArticlesTable',
    ],
    keywords: [
      'analytics',
      'metric',
      'metrics',
      'measure',
      'measures',
      'kpi',
      'dashboard',
      'chart',
      'charts',
      'graph',
      'trend',
      'performance',
      'view',
      'views',
      'engagement',
      'helpful',
      'helpfulness',
      'search',
      'keyword',
      'keywords',
      'missed search',
      'content gap',
      'content gaps',
      'date range',
      'time range',
      'last 30 days',
      'last 7 days',
      'deflection',
      'cited',
      'most cited',
      'donut',
      'area chart',
      'bar chart',
      'stat card',
      'stat grid',
      'report',
      'reporting',
      'drill',
      'drill down',
    ],
  },
];

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
  'and',
  'or',
  'in',
  'on',
  'by',
  'as',
  'be',
  'it',
  'its',
  'i',
  'we',
  'you',
  'want',
  'need',
  'should',
  'would',
]);

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

type ScoredJourney = {
  journey: Journey;
  score: number;
  matched: string[];
};

function scoreJourney(
  journey: Journey,
  prdLower: string,
  tokenSet: Set<string>,
  bigramSet: Set<string>,
): ScoredJourney {
  let score = 0;
  const matched: string[] = [];
  for (const kw of journey.keywords) {
    const k = kw.toLowerCase();
    const wc = k.split(/\s+/).length;
    if (wc === 1) {
      if (tokenSet.has(k)) {
        score += 1;
        matched.push(kw);
      }
    } else if (wc === 2) {
      if (bigramSet.has(k) || prdLower.includes(k)) {
        score += 3;
        matched.push(kw);
      }
    } else if (prdLower.includes(k)) {
      score += 5;
      matched.push(kw);
    }
  }
  return { journey, score, matched };
}

export type FindRelevantJourneyOutput = {
  bestMatch: {
    id: string;
    name: string;
    persona: string;
    entryPoint: string;
    landingPage: string;
    keyComponents: string[];
    matchedKeywords: string[];
    confidence: 'high' | 'medium' | 'low';
  } | null;
  alternates: Array<{
    id: string;
    name: string;
    score: number;
    matchedKeywords: string[];
  }>;
  guidance: string;
};

export function findRelevantJourney(
  input: FindRelevantJourneyInput,
): FindRelevantJourneyOutput {
  const prdLower = input.prd.toLowerCase();
  const tokens = tokenize(input.prd);
  const tokenSet = new Set(tokens);
  const bigramSet = new Set(bigrams(tokens));

  const scored = JOURNEYS.map((j) =>
    scoreJourney(j, prdLower, tokenSet, bigramSet),
  ).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const second = scored[1];

  if (!top || top.score === 0) {
    return {
      bestMatch: null,
      alternates: scored.map((s) => ({
        id: s.journey.id,
        name: s.journey.name,
        score: s.score,
        matchedKeywords: s.matched,
      })),
      guidance:
        "No journey keywords matched. The PRD may be net-new (no existing entry point) — check `kb://product/feature-map` for the 'NOT built today' list, or read `kb://product/journeys` and `kb://product/information-architecture` to choose where the feature should land.",
    };
  }

  const margin = top.score - (second?.score ?? 0);
  const confidence: 'high' | 'medium' | 'low' =
    margin >= 3 ? 'high' : margin >= 1 ? 'medium' : 'low';

  return {
    bestMatch: {
      id: top.journey.id,
      name: top.journey.name,
      persona: top.journey.persona,
      entryPoint: top.journey.entryPoint,
      landingPage: top.journey.landingPage,
      keyComponents: top.journey.keyComponents,
      matchedKeywords: top.matched,
      confidence,
    },
    alternates: scored
      .slice(1)
      .filter((s) => s.score > 0)
      .map((s) => ({
        id: s.journey.id,
        name: s.journey.name,
        score: s.score,
        matchedKeywords: s.matched,
      })),
    guidance:
      confidence === 'high'
        ? `Strong match for "${top.journey.name}". Read \`kb://product/journeys\` for the full journey detail, then confirm scope with the user before recommending components.`
        : confidence === 'medium'
          ? `Likely match for "${top.journey.name}", but consider alternates. Ask the user a clarifying question before committing.`
          : `Weak match — multiple journeys score similarly. Read \`kb://product/journeys\` and ask the user which journey their feature attaches to.`,
  };
}
