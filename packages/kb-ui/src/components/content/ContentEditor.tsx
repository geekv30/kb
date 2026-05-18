import * as React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { SlashCommandExtension } from './extensions/SlashCommand';
import { DEFAULT_SLASH_COMMANDS, type SlashCommand } from './SlashCommandMenu';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { createLowlight, common } from 'lowlight';
import {
  Bold02,
  Italic02,
  Underline02,
  Strikethrough02,
  List,
  Link02,
  Code02,
  CodeSquare02,
  Table as TableIcon,
  Image02,
  MessageTextSquare02,
  Divider,
  Stars02,
  DotsVertical,
  ChevronDown,
  Check,
} from '@untitledui/icons';
import { cn } from '../../utils/cn';

const lowlight = createLowlight(common);

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type ToolbarItemDef = {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** True when this item should appear pressed for the current editor selection. */
  isActive?: (editor: import('@tiptap/react').Editor) => boolean;
  /** Called when the toolbar button is clicked. */
  onClick: (editor: import('@tiptap/react').Editor) => void;
  /** Optional separator before this item (renders a vertical divider). */
  separatorBefore?: boolean;
};

export type ContentEditorProps = {
  /** Optional className override on outer card */
  className?: string;
  /**
   * Optional slot rendered inside the editor's card chrome, above the
   * body content. The caller controls its styling — no padding, border,
   * or divider is added by the editor. Use this for a title input,
   * banner, or other in-card header content.
   */
  header?: React.ReactNode;
  /** Initial content as HTML string or Tiptap JSON */
  initialContent?: string | object;
  /** Fires on each change (for autosave-on-exit plumbing above). */
  onChange?: (html: string, json: object) => void;
  /** Fires when the user clicks "Save" from the parent toolbar */
  onSave?: (html: string, json: object) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Read-only mode (e.g. preview). Default: false */
  readOnly?: boolean;
  /**
   * Override the slash-command menu's items. When omitted, the built-in
   * `DEFAULT_SLASH_COMMANDS` set is used. Filtering rules (title-prefix
   * + alias-prefix match) are applied to whichever list is active.
   */
  slashCommands?: SlashCommand[];
  /**
   * Override the BubbleMenu toolbar's button items. When omitted, the
   * built-in `DEFAULT_TOOLBAR_ITEMS` set is rendered. Only affects the
   * mapped button row between the paragraph dropdown and the overflow
   * menu — the dropdowns themselves are not configurable here.
   */
  toolbarItems?: ToolbarItemDef[];
};

/* ─────────────────────────────────────────────────────────────
 * Default toolbar items
 *
 * Each entry below mirrors a button that previously lived inline
 * inside `ContentEditorToolbar`. Order, click handlers, and active-
 * state checks are byte-for-byte identical to the prior inline JSX.
 * ───────────────────────────────────────────────────────────── */

export const DEFAULT_TOOLBAR_ITEMS: ToolbarItemDef[] = [
  {
    id: 'bold',
    label: 'Bold',
    icon: <Bold02 />,
    isActive: (editor) => editor.isActive('bold'),
    onClick: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    id: 'italic',
    label: 'Italic',
    icon: <Italic02 />,
    isActive: (editor) => editor.isActive('italic'),
    onClick: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: 'underline',
    label: 'Underline',
    icon: <Underline02 />,
    isActive: (editor) => editor.isActive('underline'),
    onClick: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    id: 'strike',
    label: 'Strikethrough',
    icon: <Strikethrough02 />,
    isActive: (editor) => editor.isActive('strike'),
    onClick: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    id: 'bulletList',
    label: 'Bulleted list',
    icon: <List />,
    isActive: (editor) => editor.isActive('bulletList'),
    onClick: (editor) => editor.chain().focus().toggleBulletList().run(),
    separatorBefore: true,
  },
  {
    id: 'orderedList',
    label: 'Numbered list',
    icon: <List />,
    isActive: (editor) => editor.isActive('orderedList'),
    onClick: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'link',
    label: 'Insert link',
    icon: <Link02 />,
    isActive: (editor) => editor.isActive('link'),
    onClick: (editor) => {
      const active = editor.isActive('link');
      if (active) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      const previousUrl = editor.getAttributes('link').href as string | undefined;
      const url =
        typeof window !== 'undefined' ? window.prompt('Enter URL', previousUrl ?? 'https://') : null;
      if (url === null) return;
      if (url === '') {
        editor.chain().focus().unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    },
    separatorBefore: true,
  },
  {
    id: 'code',
    label: 'Inline code',
    icon: <Code02 />,
    isActive: (editor) => editor.isActive('code'),
    onClick: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    id: 'codeBlock',
    label: 'Code block',
    icon: <CodeSquare02 />,
    isActive: (editor) => editor.isActive('codeBlock'),
    onClick: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'table',
    label: 'Insert table',
    icon: <TableIcon />,
    isActive: (editor) => editor.isActive('table'),
    onClick: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    id: 'aiHighlight',
    label: 'AI highlight',
    icon: <Stars02 />,
    isActive: (editor) => editor.isActive('highlight', { color: 'ai' }),
    onClick: (editor) => editor.chain().focus().toggleHighlight({ color: 'ai' }).run(),
    separatorBefore: true,
  },
];

type ParagraphType = 'paragraph' | 'heading1' | 'heading2' | 'heading3';

/* ─────────────────────────────────────────────────────────────
 * Toolbar atoms
 * ───────────────────────────────────────────────────────────── */

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      // Toolbar buttons are pressed often during editing — keep motion
      // tight: 120ms bg/color with strong ease-out + a subtle 0.96
      // press scale (motion-safe). Replaces Tailwind's catch-all
      // `transition-colors` so the curve and properties are explicit.
      style={{ transition: 'background-color 120ms cubic-bezier(0.23, 1, 0.32, 1), color 120ms cubic-bezier(0.23, 1, 0.32, 1), transform 100ms cubic-bezier(0.23, 1, 0.32, 1)' }}
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-[6px]',
        !disabled && 'motion-safe:active:scale-[0.96]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
        '[&>svg]:h-[14px] [&>svg]:w-[14px]',
        active
          ? 'bg-surface-subtle text-text-primary'
          : 'bg-transparent text-text-meta hover:bg-surface-subtle hover:text-text-primary',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-text-meta',
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-4 w-px bg-card-border shrink-0" />;
}

/* ─────────────────────────────────────────────────────────────
 * Paragraph/Heading dropdown ("N" in Figma)
 * ───────────────────────────────────────────────────────────── */

const PARAGRAPH_OPTIONS: { value: ParagraphType; label: string; shortLabel: string }[] = [
  { value: 'paragraph', label: 'Normal text', shortLabel: 'N' },
  { value: 'heading1', label: 'Heading 1', shortLabel: 'H1' },
  { value: 'heading2', label: 'Heading 2', shortLabel: 'H2' },
  { value: 'heading3', label: 'Heading 3', shortLabel: 'H3' },
];

function getCurrentParagraphType(editor: Editor): ParagraphType {
  if (editor.isActive('heading', { level: 1 })) return 'heading1';
  if (editor.isActive('heading', { level: 2 })) return 'heading2';
  if (editor.isActive('heading', { level: 3 })) return 'heading3';
  return 'paragraph';
}

function ParagraphDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const current = getCurrentParagraphType(editor);
  const currentOpt = PARAGRAPH_OPTIONS.find((o) => o.value === current) ?? PARAGRAPH_OPTIONS[0];

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const apply = (value: ParagraphType) => {
    const chain = editor.chain().focus();
    if (value === 'paragraph') chain.setParagraph().run();
    if (value === 'heading1') chain.toggleHeading({ level: 1 }).run();
    if (value === 'heading2') chain.toggleHeading({ level: 2 }).run();
    if (value === 'heading3') chain.toggleHeading({ level: 3 }).run();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Text style"
        // Mirrors ToolbarButton motion: explicit 120ms bg/color/transform
        // with strong ease-out + motion-safe press scale.
        style={{ transition: 'background-color 120ms cubic-bezier(0.23, 1, 0.32, 1), color 120ms cubic-bezier(0.23, 1, 0.32, 1), transform 100ms cubic-bezier(0.23, 1, 0.32, 1)' }}
        className={cn(
          'inline-flex h-6 items-center gap-0.5 pl-1.5 pr-0.5 rounded-[6px]',
          'motion-safe:active:scale-[0.96]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
          open ? 'bg-surface-subtle text-text-primary' : 'bg-transparent text-text-meta hover:bg-surface-subtle hover:text-text-primary',
        )}
      >
        <span className="text-[14px] font-medium leading-5">{currentOpt.shortLabel}</span>
        <ChevronDown className="h-[14px] w-[14px]" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-[8px] border border-card-border bg-white py-1 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-2px_rgba(0,0,0,0.10)]"
        >
          {PARAGRAPH_OPTIONS.map((opt) => {
            const isActive = opt.value === current;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => apply(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-[14px] leading-5 text-text-primary',
                  'hover:bg-surface-subtle focus-visible:outline-none focus-visible:bg-surface-subtle',
                )}
              >
                <span
                  className={cn(
                    opt.value === 'heading1' && 'text-[18px] font-semibold leading-[24px]',
                    opt.value === 'heading2' && 'text-[16px] font-semibold leading-[22px]',
                    opt.value === 'heading3' && 'text-[14px] font-semibold leading-5',
                    opt.value === 'paragraph' && 'font-normal',
                  )}
                >
                  {opt.label}
                </span>
                {isActive && <Check className="h-[14px] w-[14px] text-text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Overflow ("More") menu — blockquote, hr, image (features
 * requested in spec but not distinct icons in Figma toolbar)
 * ───────────────────────────────────────────────────────────── */

function OverflowMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items: { label: string; icon: React.ReactNode; action: () => void; active?: boolean }[] = [
    {
      label: 'Blockquote',
      icon: <MessageTextSquare02 className="h-[14px] w-[14px]" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive('blockquote'),
    },
    {
      label: 'Horizontal rule',
      icon: <Divider className="h-[14px] w-[14px]" />,
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      label: 'Image from URL',
      icon: <Image02 className="h-[14px] w-[14px]" />,
      action: () => {
        const url = typeof window !== 'undefined' ? window.prompt('Image URL', 'https://') : null;
        if (url) editor.chain().focus().setImage({ src: url }).run();
      },
    },
  ];

  return (
    <div ref={ref} className="relative">
      <ToolbarButton onClick={() => setOpen((o) => !o)} active={open} label="More options">
        <DotsVertical />
      </ToolbarButton>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-[8px] border border-card-border bg-white py-1 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-2px_rgba(0,0,0,0.10)]"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[14px] leading-5 text-text-primary',
                'hover:bg-surface-subtle focus-visible:outline-none focus-visible:bg-surface-subtle',
                item.active && 'bg-surface-subtle',
              )}
            >
              <span className="text-text-meta">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Floating Toolbar
 *
 * Rendered inside <BubbleMenu> (on a non-empty text selection) so
 * formatting affordances follow the selection. Empty-line block
 * insertion is handled by the slash-command popup (SlashCommand
 * extension + SlashCommandMenu), not by this toolbar.
 *
 * Width hugs children (`inline-flex w-max`) — the toolbar is exactly
 * as wide as the sum of its buttons, not the full editor card width.
 *
 * Button order mirrors Figma `53:2386` as closely as possible:
 *   [N▼]  [Bold] [Italic] [Underline] [Strike]
 *   | [Bullet list] [Numbered list]
 *   | [Link] [Inline code] [Code block] [Table]
 *   | [AI highlight] [More ▾]
 *
 * Undo / Redo are intentionally omitted from the floating surface:
 * they do not describe the selection under the cursor, and keyboard
 * (⌘Z / ⌘⇧Z) is the canonical affordance. This keeps the floating
 * menu tight and avoids noise.
 *
 * Figma also shows "Serif" font dropdown and "T" (text color). Those
 * are deliberately omitted — they are not in the v1 feature scope.
 * See design/editor.md for the full decision record.
 * ───────────────────────────────────────────────────────────── */

function ContentEditorToolbar({
  editor,
  items,
}: {
  editor: Editor;
  items: ToolbarItemDef[];
}) {
  return (
    <div
      role="toolbar"
      aria-label="Formatting toolbar"
      data-kb-part="content-editor-toolbar"
      className={cn(
        'inline-flex w-max items-center gap-0.5 rounded-[8px] border border-card-border',
        'bg-white p-1 shadow-md',
      )}
    >
      <ParagraphDropdown editor={editor} />

      <ToolbarDivider />

      {items.map((item) => (
        <React.Fragment key={item.id}>
          {item.separatorBefore && <ToolbarDivider />}
          <ToolbarButton
            onClick={() => item.onClick(editor)}
            active={item.isActive ? item.isActive(editor) : false}
            label={item.label}
          >
            {item.icon}
          </ToolbarButton>
        </React.Fragment>
      ))}

      <OverflowMenu editor={editor} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * ContentEditor
 *
 * Optional `header` slot renders inside the card chrome, above the
 * body content (no extra chrome added — caller controls styling).
 * ───────────────────────────────────────────────────────────── */

export function ContentEditor({
  className,
  header,
  initialContent,
  onChange,
  onSave,
  placeholder = 'Start writing…',
  readOnly = false,
  slashCommands,
  toolbarItems,
}: ContentEditorProps) {
  const resolvedToolbarItems = toolbarItems ?? DEFAULT_TOOLBAR_ITEMS;
  const resolvedSlashCommands = slashCommands ?? DEFAULT_SLASH_COMMANDS;
  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false, // use our own Link for custom attrs
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-[8px] my-4' },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: false, HTMLAttributes: { class: 'kb-editor-table' } }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      SlashCommandExtension.configure({ slashCommands: resolvedSlashCommands }),
    ],
    content: initialContent ?? '',
    editorProps: {
      attributes: {
        class: cn(
          'kb-editor-prose focus:outline-none',
          'min-h-[240px]',
        ),
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML(), e.getJSON());
    },
  });

  // Keep editable flag in sync when readOnly toggles
  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  // Expose a manual save (external toolbars can call ref / onSave is a one-shot
  // currently tied to external triggers; we expose it via a DOM event hook so
  // KB breadcrumb "Publish" could call editor.dom.dispatchEvent in future).
  React.useEffect(() => {
    if (!editor || !onSave) return;
    const handler = () => onSave(editor.getHTML(), editor.getJSON());
    editor.view.dom.addEventListener('kb-editor-save', handler);
    return () => editor.view.dom.removeEventListener('kb-editor-save', handler);
  }, [editor, onSave]);

  return (
    <div
      data-kb-part="content-editor"
      className={cn(
        // Figma `53:2316` ships card border `#f1f5f9` (color-border), not the
        // generic `#e2e8f0` used elsewhere — keeps Source / Editor / Settings
        // cards visually consistent on the same canvas.
        'w-[720px] rounded-[12px] border border-surface-muted bg-white p-10',
        'shadow-[0px_8px_12px_-4px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.10)]',
        className,
      )}
    >
      {header}
      <EditorContent editor={editor} />
      {!readOnly && editor && (
        <>
          {/*
            BubbleMenu — shown when there is a non-empty text selection.
            Appended to document.body so `overflow`/`transform` on the
            editor card can't clip it.
          */}
          <BubbleMenu
            editor={editor}
            appendTo={() => document.body}
            options={{ placement: 'top', offset: 8 }}
          >
            <ContentEditorToolbar editor={editor} items={resolvedToolbarItems} />
          </BubbleMenu>
          {/*
            Slash command popup is rendered imperatively by the
            SlashCommandExtension via @tiptap/suggestion — no JSX needed.
          */}
        </>
      )}
      <ContentEditorStyles />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Scoped styles for ProseMirror content
 *
 * Tailwind v4 without @tailwindcss/typography; we ship hand-rolled
 * styles matching design.md:
 *   H1 24/32/600, H2 20/28/600, H3 18/28/600, body 16/24/400
 *   AI highlight: #e7f9ee bg, 24px tall block-level strip
 * ───────────────────────────────────────────────────────────── */

function ContentEditorStyles() {
  return (
    <style>{`
      [data-kb-part="content-editor"] .kb-editor-prose {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;
        color: var(--color-text-primary);
      }

      [data-kb-part="content-editor"] .kb-editor-prose p {
        margin: 0 0 12px 0;
        min-height: 24px;
      }
      [data-kb-part="content-editor"] .kb-editor-prose p:last-child { margin-bottom: 0; }

      [data-kb-part="content-editor"] .kb-editor-prose h1 {
        font-size: 24px;
        line-height: 32px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 24px 0 12px 0;
      }
      [data-kb-part="content-editor"] .kb-editor-prose h1:first-child { margin-top: 0; }

      [data-kb-part="content-editor"] .kb-editor-prose h2 {
        font-size: 20px;
        line-height: 28px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 20px 0 12px 0;
      }
      [data-kb-part="content-editor"] .kb-editor-prose h2:first-child { margin-top: 0; }

      [data-kb-part="content-editor"] .kb-editor-prose h3 {
        font-size: 18px;
        line-height: 28px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 16px 0 8px 0;
      }
      [data-kb-part="content-editor"] .kb-editor-prose h3:first-child { margin-top: 0; }

      [data-kb-part="content-editor"] .kb-editor-prose ul,
      [data-kb-part="content-editor"] .kb-editor-prose ol {
        padding-left: 24px;
        margin: 0 0 12px 0;
      }
      [data-kb-part="content-editor"] .kb-editor-prose ul { list-style: disc; }
      [data-kb-part="content-editor"] .kb-editor-prose ol { list-style: decimal; }
      [data-kb-part="content-editor"] .kb-editor-prose li { margin: 4px 0; }
      [data-kb-part="content-editor"] .kb-editor-prose li > p { margin: 0; }

      [data-kb-part="content-editor"] .kb-editor-prose strong { font-weight: 600; }
      [data-kb-part="content-editor"] .kb-editor-prose em { font-style: italic; }
      [data-kb-part="content-editor"] .kb-editor-prose u { text-decoration: underline; }
      [data-kb-part="content-editor"] .kb-editor-prose s { text-decoration: line-through; }

      [data-kb-part="content-editor"] .kb-editor-prose a {
        color: var(--color-link);
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      [data-kb-part="content-editor"] .kb-editor-prose a:hover { color: var(--color-link-hover); }

      /* Inline code */
      [data-kb-part="content-editor"] .kb-editor-prose code {
        background-color: var(--color-surface-muted);
        color: var(--color-text-primary);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 14px;
        font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      }

      /* Code block (lowlight) */
      [data-kb-part="content-editor"] .kb-editor-prose pre {
        background-color: var(--color-text-primary);
        color: var(--color-card-border);
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
        overflow-x: auto;
        font-size: 14px;
        line-height: 20px;
      }
      [data-kb-part="content-editor"] .kb-editor-prose pre code {
        background: transparent;
        color: inherit;
        padding: 0;
        border-radius: 0;
        font-size: 14px;
      }
      /* highlight.js syntax palette — intentionally inline (not system tokens) */
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-keyword,
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-selector-tag,
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-literal { color: #c084fc; }
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-string,
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-attr { color: #86efac; }
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-number,
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-built_in { color: #fbbf24; }
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-comment { color: #64748b; font-style: italic; }
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-title,
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-function,
      [data-kb-part="content-editor"] .kb-editor-prose pre .hljs-params { color: #60a5fa; }

      /* Blockquote */
      [data-kb-part="content-editor"] .kb-editor-prose blockquote {
        border-left: 3px solid var(--color-card-border);
        padding: 4px 0 4px 16px;
        margin: 16px 0;
        color: var(--color-text-meta);
        font-style: italic;
      }

      /* Horizontal rule */
      [data-kb-part="content-editor"] .kb-editor-prose hr {
        border: none;
        border-top: 1px solid var(--color-card-border);
        margin: 24px 0;
      }

      /* Images */
      [data-kb-part="content-editor"] .kb-editor-prose img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 16px 0;
      }

      /* Table */
      [data-kb-part="content-editor"] .kb-editor-prose table,
      [data-kb-part="content-editor"] .kb-editor-prose .kb-editor-table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        table-layout: fixed;
        overflow: hidden;
      }
      [data-kb-part="content-editor"] .kb-editor-prose th,
      [data-kb-part="content-editor"] .kb-editor-prose td {
        border: 1px solid #e5e5e5;
        padding: 8px 12px;
        vertical-align: top;
        text-align: left;
        font-size: 14px;
        line-height: 20px;
        min-width: 60px;
      }
      [data-kb-part="content-editor"] .kb-editor-prose th {
        background-color: var(--color-surface-subtle);
        font-weight: 600;
        color: var(--color-text-primary);
      }
      [data-kb-part="content-editor"] .kb-editor-prose td { color: var(--color-text-primary); }
      [data-kb-part="content-editor"] .kb-editor-prose .selectedCell {
        background-color: rgba(231, 249, 238, 0.6);
      }

      /* AI Highlight — block-level strip (#e7f9ee bg, min 24px).
         Configured via Highlight({ color: 'ai' }). */
      [data-kb-part="content-editor"] .kb-editor-prose mark[data-color="ai"],
      [data-kb-part="content-editor"] .kb-editor-prose mark[style*="e7f9ee"] {
        background-color: var(--color-highlight);
        color: var(--color-text-primary);
        padding: 2px 6px;
        border-radius: 4px;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }
      /* Placeholder */
      [data-kb-part="content-editor"] .kb-editor-prose p.is-editor-empty:first-child::before {
        color: var(--color-text-disabled);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }

      /* ProseMirror editing polish */
      [data-kb-part="content-editor"] .ProseMirror { outline: none; }
      [data-kb-part="content-editor"] .ProseMirror-focused { outline: none; }
      [data-kb-part="content-editor"] .ProseMirror ::selection { background-color: var(--color-highlight); }
    `}</style>
  );
}
