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
//
// With `onEdit`, the text between suggestions is editable in place (like
// the old editor); suggestion regions stay locked so an edit can never
// overlap an AI change. Each editable run is seeded once per mount, so
// typing never fights React, and the whole body is handed back on blur.
// Pastes land as plain text. Clicking an undecided suggestion's (locked)
// text opens that suggestion.

import { forwardRef, useLayoutEffect, useMemo, useRef, type ClipboardEvent, Fragment, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { resolveSegment, type ReviewDocument, type SuggestionSegment } from './reviewDocument';
import type { ReviewDecision } from './reviewState';

/**
 * `diff` (auto mode): the change stays marked up — removed text struck
 * through, added text highlighted — without the active card's motion,
 * so every change Hiver AI made is visible at once.
 */
export type BodySuggestionState = 'inactive' | 'active' | 'diff' | ReviewDecision;

export interface ReviewArticleBodyProps {
  title: string;
  document: ReviewDocument;
  states: Record<string, BodySuggestionState>;
  /** Makes the text between suggestions editable; called on blur with the full body. */
  onEdit?: (bodyHTML: string) => void;
  /** Called on the first keystroke, before any blur. */
  onDirty?: () => void;
  /** Clicking an undecided suggestion's text opens it in the rail. */
  onActivateSuggestion?: (id: string) => void;
  /** Rendered right after a suggestion's text (auto mode's per-change line). */
  renderAfter?: (suggestionId: string) => ReactNode;
  className?: string;
}

const TEXT_BLOCKS = 'h1, h2, h3, h4, h5, h6, p, li, blockquote';

type HighlightVariant = 'add' | 'remove';

/**
 * Wraps the text of every innermost text block in a `.lk-hl` span (the
 * span sits inside the block, so list markers stay outside the wash).
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
  return template.innerHTML;
}

const MOUNT_MOTION = 'motion-safe:animate-lk-suggestion-mount motion-reduce:animate-lk-fade-in-reduced';

function Html({ html }: { html: string }) {
  return <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />;
}

interface EditableHtmlProps {
  html: string;
  register: (el: HTMLDivElement | null) => void;
  onInput: () => void;
  onBlur: () => void;
}

/** Pastes as plain text, so styles copied from elsewhere never land in the article. */
function pastePlainText(e: ClipboardEvent<HTMLDivElement>) {
  e.preventDefault();
  document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
}

/** A static run as an uncontrolled editable block: seeded on mount only. */
function EditableHtml({ html, register, onInput, onBlur }: EditableHtmlProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const seed = useRef(html);
  useLayoutEffect(() => {
    if (ref.current) ref.current.innerHTML = seed.current;
  }, []);
  return (
    <div
      ref={(el) => {
        ref.current = el;
        register(el);
      }}
      role="textbox"
      aria-multiline="true"
      aria-label="Article content"
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onInput={onInput}
      onBlur={onBlur}
      onPaste={pastePlainText}
      className="cursor-text outline-none"
    />
  );
}

/**
 * Splitting a block in a contenteditable clones its attributes, so a
 * `data-block-id` can appear twice. The first one (the original) stays
 * the anchor; the copies lose the id.
 */
function dedupeBlockIds(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  const seen = new Set<string>();
  template.content.querySelectorAll<HTMLElement>('[data-block-id]').forEach((el) => {
    const id = el.dataset.blockId ?? '';
    if (seen.has(id)) el.removeAttribute('data-block-id');
    else seen.add(id);
  });
  return template.innerHTML;
}

interface SuggestionRegionProps {
  segment: SuggestionSegment;
  state: BodySuggestionState;
  onActivate?: (id: string) => void;
}

function SuggestionRegion({ segment, state, onActivate }: SuggestionRegionProps) {
  const id = segment.suggestionId;
  const active = state === 'active';
  const marked = active || state === 'diff';

  const html = useMemo(() => {
    if (marked) {
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
  }, [segment, state, marked]);

  if (!html) {
    // Hidden content: a zero-height anchor keeps the rail pairing.
    return <span aria-hidden data-suggestion-id={id} className="block h-0" />;
  }
  // Suggestion text is locked; clicking an undecided one explains why
  // by opening it (highlight + card) instead of silently ignoring the click.
  const activate = state === 'inactive' && onActivate ? () => onActivate(id) : undefined;
  return (
    <div
      data-suggestion-id={id}
      data-suggestion-state={state}
      onClick={activate}
      className={cn(active && MOUNT_MOTION, activate && 'cursor-pointer')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export const ReviewArticleBody = forwardRef<HTMLElement, ReviewArticleBodyProps>(function ReviewArticleBody(
  { title, document: reviewDocument, states, onEdit, onDirty, onActivateSuggestion, renderAfter, className },
  ref,
) {
  const editables = useRef(new Map<number, HTMLDivElement>());

  // The body as it stands with every suggestion still undecided: edited
  // static runs from the DOM, suggestion regions as they are today.
  const commit = () => {
    if (!onEdit) return;
    const body = reviewDocument.segments
      .map((seg, i) =>
        seg.kind === 'static' ? (editables.current.get(i)?.innerHTML ?? seg.html) : resolveSegment(seg, undefined),
      )
      .join('');
    onEdit(dedupeBlockIds(body));
  };

  return (
    <article
      ref={ref}
      aria-label={title}
      className={cn('ck-content relative box-border min-w-0 break-words text-legacy-editor', className)}
    >
      <h1>{title}</h1>
      {reviewDocument.segments.map((segment, i) =>
        segment.kind === 'static' ? (
          onEdit ? (
            <EditableHtml
              key={`static-${i}`}
              html={segment.html}
              register={(el) => {
                if (el) editables.current.set(i, el);
                else editables.current.delete(i);
              }}
              onInput={() => onDirty?.()}
              onBlur={commit}
            />
          ) : (
            <Html key={`static-${i}`} html={segment.html} />
          )
        ) : (
          <Fragment key={`${segment.suggestionId}-${states[segment.suggestionId] ?? 'inactive'}`}>
            <SuggestionRegion
              segment={segment}
              state={states[segment.suggestionId] ?? 'inactive'}
              onActivate={onActivateSuggestion}
            />
            {renderAfter?.(segment.suggestionId)}
          </Fragment>
        ),
      )}
    </article>
  );
});
