// Chunk 2 — Notion-style title input that lives inside the ContentEditor
// card chrome via the editor's `header` slot.
//
// Visual contract:
//   - Large display heading (36/44, bold, text-text-primary).
//   - Placeholder "Untitled" in slate-300 — same typography as the value.
//   - Transparent chrome (no border, no background, no shadow).
//   - Auto-grows vertically as the value wraps.
//   - 24px margin below so the title visually separates from body content.
//
// Behaviour:
//   - Enter key inserts no newline — instead the textarea blurs. The user
//     can then click into the body or press Tab to continue typing. Blur
//     (rather than focus-jump to the body) keeps the component decoupled
//     from the editor instance — the body's `.ProseMirror` element isn't
//     reachable from here without prop drilling.
//   - Autofocus on mount when the value is empty (new-article landing).
//     Skipped for existing articles so we don't steal focus.
//
// The autosize hook re-measures on every value change by collapsing the
// height to `auto` then snapping it back to `scrollHeight`. This is the
// canonical Notion-style trick.

import { useEffect, useLayoutEffect, useRef } from 'react';

export type ArticleTitleInputProps = {
  value: string;
  onChange: (next: string) => void;
  /** Autofocus when mounted with an empty value. Defaults to true. */
  autoFocusOnEmpty?: boolean;
};

export function ArticleTitleInput({
  value,
  onChange,
  autoFocusOnEmpty = true,
}: ArticleTitleInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Autosize on every value change. useLayoutEffect avoids a one-frame
  // flicker when the value comes in pre-populated on mount.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  // Autofocus only if the field is empty on mount (new-article path).
  useEffect(() => {
    if (!autoFocusOnEmpty) return;
    if (value !== '') return;
    ref.current?.focus({ preventScroll: true });
    // Intentionally mount-only — re-running on `value` would steal focus
    // back every time the user typed and then cleared the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // Suppress the newline; blur so focus is free for the editor body.
          e.preventDefault();
          ref.current?.blur();
        }
      }}
      placeholder="Untitled"
      aria-label="Article title"
      data-kb-part="article-title-input"
      className={[
        'mb-6 block w-full',
        'border-0 bg-transparent p-0 outline-none',
        'resize-none overflow-hidden',
        'text-[36px] font-bold leading-[44px] text-text-primary',
        'placeholder:text-slate-300',
      ].join(' ')}
    />
  );
}
