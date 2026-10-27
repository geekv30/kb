import { useLayoutEffect, useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';

export interface ArticleEditorChange {
  title: string;
  bodyHTML: string;
}

export interface ArticleEditorProps {
  /** Initial title; rendered as the in-content <h1> (CKEditor Title plugin). */
  title: string;
  /** Initial body HTML (everything after the title). */
  bodyHTML: string;
  onChange: (change: ArticleEditorChange) => void;
  /**
   * Px taken above the editor inside its column (e.g. the AI suggestions
   * banner + gap), subtracted from the live content height so the page
   * still fits the viewport.
   */
  heightOffset?: number;
}

const TITLE_PLACEHOLDER = 'Title';
const BODY_PLACEHOLDER = 'Type your article here...';

function escapeHTML(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Re-applies CKEditor-style placeholders to an empty title / body. */
function syncPlaceholders(root: HTMLElement) {
  const blocks = Array.from(root.children) as HTMLElement[];
  const [titleEl, ...rest] = blocks;
  const setPlaceholder = (el: HTMLElement | undefined, text: string, empty: boolean) => {
    if (!el) return;
    el.classList.toggle('ck-placeholder', empty);
    if (empty) el.setAttribute('data-placeholder', text);
    else el.removeAttribute('data-placeholder');
  };
  setPlaceholder(titleEl, TITLE_PLACEHOLDER, (titleEl?.textContent ?? '').trim() === '');
  const bodyEmpty = rest.every((el) => (el.textContent ?? '').trim() === '' && !el.querySelector('img'));
  rest.forEach((el, i) => setPlaceholder(el, BODY_PLACEHOLDER, bodyEmpty && rest.length === 1 && i === 0));
}

function serialize(root: HTMLElement): ArticleEditorChange {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.ck-placeholder').forEach((el) => {
    el.classList.remove('ck-placeholder');
    el.removeAttribute('data-placeholder');
    if (el.getAttribute('class') === '') el.removeAttribute('class');
  });
  const [titleEl, ...rest] = Array.from(clone.children) as HTMLElement[];
  const bodyHTML = rest
    .map((el) => el.outerHTML)
    .join('')
    .replace(/^<p><br><\/p>$/, '');
  return { title: (titleEl?.textContent ?? '').trim(), bodyHTML };
}

/*
 * CKEditor 5 lookalike: static toolbar + `contenteditable` content.
 * Live overrides: `.ck-editor__main` height calc(100vh - 200px),
 * overflow-y auto, padding 0 20px; editable padding 0 4px plus
 * CKEditor's 1px border (recolored white); content
 * typography in styles.css (`.ck-content`). The DOM is seeded once per
 * mount (key the component by article) so typing never fights React.
 */
export function ArticleEditor({ title, bodyHTML, onChange, heightOffset = 0 }: ArticleEditorProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const seed = useRef({ title, bodyHTML });

  useLayoutEffect(() => {
    const root = editableRef.current;
    if (!root) return;
    const { title: t, bodyHTML: b } = seed.current;
    root.innerHTML = `<h1>${t ? escapeHTML(t) : '<br>'}</h1>${b || '<p><br></p>'}`;
    syncPlaceholders(root);
  }, []);

  const handleInput = () => {
    const root = editableRef.current;
    if (!root) return;
    if (!root.firstElementChild || root.firstElementChild.tagName !== 'H1') {
      root.insertAdjacentHTML('afterbegin', '<h1><br></h1>');
    }
    syncPlaceholders(root);
    onChange(serialize(root));
  };

  return (
    <div className="relative">
      <EditorToolbar />
      <div className="box-border overflow-y-auto px-[20px]" style={{ height: `calc(100vh - ${200 + heightOffset}px)` }}>
        <div
          ref={editableRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Article content"
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={handleInput}
          className="ck-content box-border overflow-auto rounded-b-[2px] border border-solid border-white bg-white px-[4px] py-0 break-words"
        />
      </div>
    </div>
  );
}
