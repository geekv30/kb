// Read-only article for the review view, rendered with the old CKEditor
// content typography (`.ck-content`).
//
// The body comes from `buildReviewDocument` — the same segments
// `applyDecisions` resolves on publish. Only the ACTIVE suggestion is
// highlighted (as in the new UI); every other state renders plain text:
//
// | Type     | Inactive / undecided | Active                 | Accepted  | Dismissed |
// | -------- | -------------------- | ---------------------- | --------- | --------- |
// | addition | new content (plain)  | new content, green     | new       | hidden    |
// | replace  | old content          | old red + new green    | new       | old       |
// | removal  | old content          | old content, red       | hidden    | old       |
//
// Every suggestion keeps a `data-suggestion-id` anchor in the DOM, even
// when its content is hidden, so its rail card stays paired.

import { forwardRef, useMemo } from 'react';
import { cn } from '../lib/cn';
import { resolveSegment, type ReviewDocument, type SuggestionSegment } from './reviewDocument';
import type { ReviewDecision } from './reviewState';

export type BodySuggestionState = 'inactive' | 'active' | ReviewDecision;

export interface ReviewArticleBodyProps {
  title: string;
  document: ReviewDocument;
  states: Record<string, BodySuggestionState>;
  className?: string;
}

const TEXT_BLOCKS = 'h1, h2, h3, h4, h5, h6, p, li, blockquote';

type HighlightVariant = 'add' | 'remove';

/**
 * Wraps the text of every innermost text block in a `.lk-hl` span (the
 * span sits inside the block, so list markers stay outside the wash) and
 * the whole fragment in a `.lk-region` that draws the gutter bar.
 */
function highlightHTML(html: string, variant: HighlightVariant): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll<HTMLElement>(TEXT_BLOCKS).forEach((el) => {
    if (el.querySelector(TEXT_BLOCKS) || !el.textContent?.trim()) return;
    const span = document.createElement('span');
    span.className = 'lk-hl';
    span.dataset.variant = variant;
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
  });
  const blocks = template.content.querySelectorAll(TEXT_BLOCKS);
  const endsInList = blocks[blocks.length - 1]?.tagName === 'LI';
  return `<div class="lk-region" data-variant="${variant}"${endsInList ? ' data-ends-in-list' : ''}>${template.innerHTML}</div>`;
}

const MOUNT_MOTION = 'motion-safe:animate-lk-suggestion-mount motion-reduce:animate-lk-fade-in-reduced';

function Html({ html }: { html: string }) {
  return <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />;
}

interface SuggestionRegionProps {
  segment: SuggestionSegment;
  state: BodySuggestionState;
}

function SuggestionRegion({ segment, state }: SuggestionRegionProps) {
  const id = segment.suggestionId;
  const active = state === 'active';

  const html = useMemo(() => {
    if (active) {
      switch (segment.kind) {
        case 'addition':
          return highlightHTML(segment.newHTML, 'add');
        case 'replace':
          return highlightHTML(segment.oldHTML, 'remove') + highlightHTML(segment.newHTML, 'add');
        case 'removal':
          return highlightHTML(segment.oldHTML, 'remove');
        default: {
          const exhaustive: never = segment;
          return exhaustive;
        }
      }
    }
    // An undecided addition previews its content in place (as the new UI
    // does); everything else is exactly what publishing would write.
    if (state === 'inactive' && segment.kind === 'addition') return segment.newHTML;
    return resolveSegment(segment, state === 'inactive' ? undefined : state);
  }, [segment, state, active]);

  if (!html) {
    // Hidden content: a zero-height anchor keeps the rail pairing.
    return <span aria-hidden data-suggestion-id={id} className="block h-0" />;
  }
  return (
    <div
      data-suggestion-id={id}
      data-suggestion-state={state}
      className={cn(active && MOUNT_MOTION)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export const ReviewArticleBody = forwardRef<HTMLElement, ReviewArticleBodyProps>(function ReviewArticleBody(
  { title, document: reviewDocument, states, className },
  ref,
) {
  return (
    <article
      ref={ref}
      aria-label={title}
      className={cn('ck-content relative box-border min-w-0 break-words text-legacy-editor', className)}
    >
      <h1>{title}</h1>
      {reviewDocument.segments.map((segment, i) =>
        segment.kind === 'static' ? (
          <Html key={`static-${i}`} html={segment.html} />
        ) : (
          <SuggestionRegion
            key={`${segment.suggestionId}-${states[segment.suggestionId] ?? 'inactive'}`}
            segment={segment}
            state={states[segment.suggestionId] ?? 'inactive'}
          />
        ),
      )}
    </article>
  );
});
