import { Fragment } from 'react';
import { cn } from '../../lib/cn';
import { TOOLBAR_GLYPHS, type ToolbarGlyphName } from './toolbarGlyphs';

/*
 * Static lookalike of the live CKEditor 5 toolbar. Geometry follows the
 * live overrides in `864.chunk.css` on top of CKEditor's Lark theme:
 *   toolbar     36px, padding 6px, white, radius 2px 2px 0 0,
 *               shadow 0 2px 10px rgba(0,0,0,.15) on the top wrapper
 *   button      24x24, padding 4px, 16px icon, margin 0 4px, no border
 *   dropdown    margin 0 4px, button padding 0 4px, 8px arrow 4px after
 *   split       CKEditor default buttons (1px transparent border, 4px
 *               padding): 26px action + 18px arrow
 *   separator   1x24 #d1e0f1, no margin
 *   hover       #e8e8e8, radius 2px (enabled controls only)
 *   disabled    icon / label opacity .5 (CKEditor --ck-disabled-opacity)
 * Buttons are non-functional; `enabled` mirrors what the live toolbar
 * shows with the caret in the title (image, alignment, "more").
 */

type ToolbarItem =
  | { kind: 'button'; label: string; glyph: ToolbarGlyphName; enabled?: boolean }
  | { kind: 'dropdown'; label: string; glyph: ToolbarGlyphName; enabled?: boolean }
  | { kind: 'split'; label: string; glyph: ToolbarGlyphName; enabled?: boolean }
  | { kind: 'heading'; label: string; text: string; enabled?: boolean }
  | { kind: 'separator' };

/** Live toolbar config order, up to where the grouping overflow starts. */
const ITEMS: ToolbarItem[] = [
  { kind: 'heading', label: 'Heading', text: 'Choose heading' },
  { kind: 'separator' },
  { kind: 'button', label: 'Bold', glyph: 'bold' },
  { kind: 'button', label: 'Italic', glyph: 'italic' },
  { kind: 'button', label: 'Underline', glyph: 'underline' },
  { kind: 'button', label: 'Link', glyph: 'link' },
  { kind: 'split', label: 'Bulleted List', glyph: 'bulletedList' },
  { kind: 'split', label: 'Numbered List', glyph: 'numberedList' },
  { kind: 'button', label: 'To-do List', glyph: 'todoList' },
  { kind: 'separator' },
  { kind: 'button', label: 'Decrease indent', glyph: 'outdent' },
  { kind: 'button', label: 'Increase indent', glyph: 'indent' },
  { kind: 'separator' },
  { kind: 'button', label: 'Upload image', glyph: 'image', enabled: true },
  { kind: 'button', label: 'Block quote', glyph: 'blockQuote' },
  { kind: 'dropdown', label: 'Insert table', glyph: 'table' },
  { kind: 'dropdown', label: 'Insert media', glyph: 'media' },
  { kind: 'separator' },
  { kind: 'button', label: 'Undo', glyph: 'undo' },
  { kind: 'button', label: 'Redo', glyph: 'redo' },
  { kind: 'separator' },
  { kind: 'button', label: 'Page break', glyph: 'pageBreak' },
  { kind: 'button', label: 'Horizontal line', glyph: 'horizontalLine' },
  { kind: 'separator' },
  { kind: 'dropdown', label: 'Text alignment', glyph: 'alignLeft', enabled: true },
  { kind: 'button', label: 'Code', glyph: 'code' },
  { kind: 'split', label: 'Insert code block', glyph: 'codeBlock' },
];

function Glyph({ name, width = 16, height = 16 }: { name: ToolbarGlyphName; width?: number; height?: number }) {
  const glyph = TOOLBAR_GLYPHS[name];
  return (
    <svg
      aria-hidden
      viewBox={glyph.viewBox}
      width={width}
      height={height}
      className="block shrink-0 fill-current"
      dangerouslySetInnerHTML={{ __html: glyph.markup }}
    />
  );
}

/** CKEditor's dropdown arrow: 8px wide inside a 16px-tall icon box. */
function Arrow({ dim }: { dim: boolean }) {
  return (
    <span className={cn('ml-[4px] block', dim && 'opacity-50')}>
      <Glyph name="dropdownArrow" width={8} height={16} />
    </span>
  );
}

const HOVER = 'enabled:hover:bg-legacy-toolbar-hover enabled:hover:rounded-[2px]';
const BUTTON_BASE =
  'm-0 box-border inline-flex cursor-default items-center justify-center rounded-[2px] bg-transparent text-legacy-ink outline-none focus-visible:shadow-[0_0_0_1px_#1473e6] disabled:cursor-default';

function ToolbarControl({ item }: { item: Exclude<ToolbarItem, { kind: 'separator' }> }) {
  const enabled = item.enabled ?? false;
  const dim = !enabled;

  switch (item.kind) {
    case 'button':
      return (
        <button
          type="button"
          aria-label={item.label}
          disabled={!enabled}
          className={cn(BUTTON_BASE, 'mx-[4px] h-[24px] w-[24px] border-0 p-[4px]', HOVER)}
        >
          <span className={cn('block', dim && 'opacity-50')}>
            <Glyph name={item.glyph} />
          </span>
        </button>
      );
    case 'dropdown':
      return (
        <div className="relative mx-[4px] box-border">
          <button
            type="button"
            aria-label={item.label}
            aria-haspopup="true"
            disabled={!enabled}
            className={cn(BUTTON_BASE, 'h-[24px] border-0 px-[4px] py-0', HOVER, 'enabled:hover:p-[4px]')}
          >
            <span className={cn('block', dim && 'opacity-50')}>
              <Glyph name={item.glyph} />
            </span>
            <Arrow dim={dim} />
          </button>
        </div>
      );
    case 'split':
      return (
        <div className="relative mx-[4px] box-border flex">
          <button
            type="button"
            aria-label={item.label}
            disabled={!enabled}
            className={cn(BUTTON_BASE, 'min-h-[16px] border border-solid border-transparent p-[4px]', HOVER)}
          >
            <span className={cn('block', dim && 'opacity-50')}>
              <Glyph name={item.glyph} />
            </span>
          </button>
          <button
            type="button"
            aria-label={`${item.label} options`}
            aria-haspopup="true"
            disabled={!enabled}
            className={cn(BUTTON_BASE, 'border border-solid border-transparent p-[4px]', HOVER)}
          >
            <span className={cn('block', dim && 'opacity-50')}>
              <Glyph name="dropdownArrow" width={8} height={16} />
            </span>
          </button>
        </div>
      );
    case 'heading':
      return (
        <div className="relative mx-[4px] box-border">
          <button
            type="button"
            aria-label={item.label}
            aria-haspopup="true"
            disabled={!enabled}
            className={cn(BUTTON_BASE, 'h-[24px] w-full border-0 px-[4px] py-0', HOVER, 'enabled:hover:p-[4px]')}
          >
            <span
              className={cn(
                'box-border inline-block h-[16px] w-[8em] overflow-hidden text-left align-middle font-ck text-[12px] leading-[14px] font-normal text-ellipsis whitespace-nowrap text-legacy-body',
                dim && 'opacity-50',
              )}
            >
              {item.text}
            </span>
            <Arrow dim={dim} />
          </button>
        </div>
      );
  }
}

function Separator() {
  return <span aria-hidden className="block w-[1px] min-w-[1px] self-stretch bg-legacy-input-border p-0" />;
}

export function EditorToolbar() {
  return (
    // Above the scrolling body, so its shadow runs the full width instead
    // of showing only past the body's side padding.
    <div className="relative z-[1] shadow-legacy-toolbar">
      <div
        role="toolbar"
        aria-label="Editor toolbar"
        className="box-border flex max-h-[36px] flex-row flex-nowrap items-center rounded-t-[2px] bg-white p-[6px] font-ck text-[13px] select-none"
      >
        <div className="box-border flex h-[24px] grow-0 flex-row flex-nowrap items-center">
          {ITEMS.map((item, index) => (
            <Fragment key={index}>
              {item.kind === 'separator' ? <Separator /> : <ToolbarControl item={item} />}
            </Fragment>
          ))}
        </div>
        <span aria-hidden className="block h-[24px] w-[1px] min-w-[1px] bg-legacy-input-border" />
        <button
          type="button"
          aria-label="Show more items"
          aria-haspopup="true"
          className={cn(BUTTON_BASE, 'h-[24px] w-[24px] border-0 p-[4px]', HOVER)}
        >
          <Glyph name="more" />
        </button>
      </div>
    </div>
  );
}
