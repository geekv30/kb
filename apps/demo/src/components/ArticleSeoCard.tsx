// Article-level SEO card — implements PRD §6.5 (AI Meta Description
// Generator) and §6.4 (Canonical URL Management).
//
// Composed entirely from kb-ui primitives (Card, Button, TextInput, AiIcon)
// + a native textarea. Lives at the demo-app level so kb-ui stays untouched.

import { useMemo, useState } from 'react';
import {
  AiIcon,
  Button,
  Card,
  TextInput,
  cn,
} from '@test-kb-ui/kb-ui';

const META_DESC_MAX = 160;
const META_DESC_OPTIMAL_LO = 150;
const AI_MIN_WORDS = 200;
const PRIMARY_DOMAIN = 'https://help.hiver.com';

export type ArticleSeoCardValue = {
  metaDescription: string;
  canonicalUrlOverride: string;
};

export type ArticleSeoCardProps = {
  value: ArticleSeoCardValue;
  onChange: (next: ArticleSeoCardValue) => void;
  /** Article body HTML used for word count + AI generation context. */
  bodyHTML: string;
  /** Article title — drives the auto-generated canonical default. */
  title: string;
  /** Article slug — drives the auto-generated canonical default. */
  slug: string;
  className?: string;
};

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────── */

function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(html: string): number {
  const text = stripHtmlToText(html);
  if (!text) return 0;
  return text.split(' ').length;
}

function autoCanonical(slug: string): string {
  return `${PRIMARY_DOMAIN}/${slug}`;
}

function counterTone(
  count: number,
): { color: string; label: string } {
  if (count === 0) {
    return { color: '#64748b', label: 'Empty' };
  }
  if (count >= META_DESC_OPTIMAL_LO && count <= META_DESC_MAX) {
    return { color: '#15803d', label: 'Optimal' };
  }
  if (count > META_DESC_MAX) {
    return { color: '#dc2626', label: 'Too long' };
  }
  if (count >= 120) {
    return { color: '#15803d', label: 'Almost optimal' };
  }
  return { color: '#64748b', label: 'Too short' };
}

/**
 * Mock AI generator — chooses a plausible meta description from the
 * first paragraph of the body, padded to land in the 150–160 range.
 * In production this would call Hiver's AI infra.
 */
function mockGenerateMetaDescription(args: {
  title: string;
  bodyHTML: string;
}): string {
  const text = stripHtmlToText(args.bodyHTML);
  const firstSentence =
    text.split(/(?<=[.!?])\s+/).find((s) => s.length > 40) ?? text;
  const lead = firstSentence.slice(0, 140).replace(/[\s,]+$/, '');
  const candidate = `${lead.replace(/\.$/, '')}. Learn more about ${args.title.toLowerCase()}.`;
  if (candidate.length <= META_DESC_MAX) return candidate;
  return candidate.slice(0, META_DESC_MAX - 1).replace(/\s+\S*$/, '') + '…';
}

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function ArticleSeoCard({
  value,
  onChange,
  bodyHTML,
  title,
  slug,
  className,
}: ArticleSeoCardProps) {
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(
    Boolean(value.canonicalUrlOverride),
  );

  const words = useMemo(() => wordCount(bodyHTML), [bodyHTML]);
  const aiReady = words >= AI_MIN_WORDS;
  const descLen = value.metaDescription.length;
  const tone = counterTone(descLen);
  const canonicalDefault = autoCanonical(slug);
  const canonicalEffective =
    value.canonicalUrlOverride.trim() || canonicalDefault;

  /* ── AI generation ───────────────────────────────────────── */

  const handleGenerate = () => {
    if (!aiReady || generating) return;
    setGenerating(true);
    setSuggestion(null);
    // Simulated 1.5s job — PRD §6.5 says <3s.
    window.setTimeout(() => {
      const text = mockGenerateMetaDescription({ title, bodyHTML });
      setSuggestion(text);
      setGenerating(false);
    }, 1500);
  };

  const acceptSuggestion = () => {
    if (!suggestion) return;
    onChange({ ...value, metaDescription: suggestion });
    setSuggestion(null);
  };

  const editSuggestion = () => {
    if (!suggestion) return;
    onChange({ ...value, metaDescription: suggestion });
    setSuggestion(null);
  };

  const dismissSuggestion = () => {
    setSuggestion(null);
  };

  /* ── Canonical URL override ──────────────────────────────── */

  const resetCanonical = () => {
    onChange({ ...value, canonicalUrlOverride: '' });
  };

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <Card
      as="section"
      padding="md"
      className={cn('flex flex-col gap-5', className)}
      data-kb-app-component="article-seo-card"
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[14px] font-semibold leading-[20px] text-[#0f172a]">
            SEO
          </h2>
          <p className="text-[12px] font-normal leading-[18px] text-[#64748b]">
            Optimise how this article appears in search results.
          </p>
        </div>
      </header>

      {/* ── Meta description ───────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="seo-meta-description"
            className="text-[13px] font-medium leading-[18px] text-[#0f172a]"
          >
            Meta description
          </label>
          <span
            className="text-[12px] font-normal leading-[18px] tabular-nums"
            style={{ color: tone.color }}
            aria-label={`${descLen} of ${META_DESC_MAX} characters — ${tone.label}`}
          >
            {descLen}/{META_DESC_MAX} · {tone.label}
          </span>
        </div>

        {suggestion ? (
          <SuggestionPanel
            suggestion={suggestion}
            onAccept={acceptSuggestion}
            onEdit={editSuggestion}
            onRegenerate={handleGenerate}
            onDismiss={dismissSuggestion}
            regenerating={generating}
          />
        ) : (
          <textarea
            id="seo-meta-description"
            value={value.metaDescription}
            onChange={(e) =>
              onChange({ ...value, metaDescription: e.target.value })
            }
            placeholder="Search engines will auto-generate a snippet from your article body if you leave this empty."
            rows={3}
            maxLength={META_DESC_MAX + 40}
            className={cn(
              'w-full resize-y rounded-lg border bg-white px-3 py-2',
              'text-[14px] font-normal leading-5 text-[#0f172a]',
              'placeholder:text-[#94a3b8]',
              'outline-none focus:border-[#94a3b8] focus:ring-2 focus:ring-black/5',
              descLen > META_DESC_MAX
                ? 'border-[#dc2626]'
                : 'border-[#e5e5e5]',
            )}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <p
            className="text-[12px] font-normal leading-[18px] text-[#64748b]"
            id="ai-helper-text"
          >
            {aiReady
              ? 'Have AI draft an SEO-optimised description from your article.'
              : `Add at least ${AI_MIN_WORDS} words (${words}/${AI_MIN_WORDS}) to enable AI generation.`}
          </p>
          <Button
            variant="subtle"
            disabled={!aiReady || generating || Boolean(suggestion)}
            onClick={handleGenerate}
            icon={<AiIcon size={14} />}
            aria-describedby="ai-helper-text"
          >
            {generating ? 'Generating…' : 'Generate with AI'}
          </Button>
        </div>
      </section>

      <div className="h-px w-full bg-[#e2e8f0]" />

      {/* ── Canonical URL ──────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium leading-[18px] text-[#0f172a]">
            Canonical URL
          </span>
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="text-[12px] font-medium leading-[18px] text-[#0f172a] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-sm"
            aria-expanded={advancedOpen}
            aria-controls="seo-canonical-advanced"
          >
            {advancedOpen ? 'Hide override' : 'Customize'}
          </button>
        </div>

        <p className="text-[12px] font-normal leading-[18px] text-[#64748b]">
          Auto-generated. Search engines treat this URL as the primary version
          when the same content is reachable via multiple paths.
        </p>

        <div
          className="flex items-center gap-2 rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-3 py-2"
          aria-label="Canonical URL preview"
        >
          <code className="flex-1 truncate text-[13px] font-normal leading-[18px] text-[#0f172a]">
            {canonicalEffective}
          </code>
          {value.canonicalUrlOverride.trim() && (
            <span className="shrink-0 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[11px] font-medium leading-[16px] text-[#92400e]">
              Overridden
            </span>
          )}
        </div>

        {advancedOpen && (
          <div
            id="seo-canonical-advanced"
            className="flex flex-col gap-2 pt-1"
          >
            <label
              htmlFor="seo-canonical-override"
              className="text-[12px] font-medium leading-[18px] text-[#475569]"
            >
              Override canonical URL
            </label>
            <TextInput
              id="seo-canonical-override"
              value={value.canonicalUrlOverride}
              onChange={(e) =>
                onChange({ ...value, canonicalUrlOverride: e.target.value })
              }
              placeholder={canonicalDefault}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-normal leading-[16px] text-[#94a3b8]">
                Use only when this article is a duplicate of another canonical page.
              </p>
              {value.canonicalUrlOverride.trim() && (
                <Button variant="ghost" onClick={resetCanonical}>
                  Reset to default
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Suggestion sub-panel — visual language borrowed from
 * AIGapSuggestionCard's accept/dismiss flow but scoped to a
 * single textarea field.
 * ───────────────────────────────────────────────────────────── */

type SuggestionPanelProps = {
  suggestion: string;
  onAccept: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  onDismiss: () => void;
  regenerating: boolean;
};

function SuggestionPanel({
  suggestion,
  onAccept,
  onEdit,
  onRegenerate,
  onDismiss,
  regenerating,
}: SuggestionPanelProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-3"
      role="region"
      aria-label="AI-generated meta description suggestion"
    >
      <div className="flex items-center gap-1.5">
        <AiIcon size={14} />
        <span className="text-[12px] font-semibold leading-[18px] text-[#0f172a]">
          AI suggestion
        </span>
        <span className="text-[12px] font-normal leading-[18px] text-[#64748b]">
          · {suggestion.length}/{META_DESC_MAX} chars
        </span>
      </div>
      <p className="text-[14px] font-normal leading-[20px] text-[#0f172a]">
        {suggestion}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={onAccept}>
          Accept
        </Button>
        <Button variant="subtle" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="ghost"
          onClick={onRegenerate}
          disabled={regenerating}
        >
          {regenerating ? 'Regenerating…' : 'Regenerate'}
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
