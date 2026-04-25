import * as React from 'react';
import {
  RiH1,
  RiH2,
  RiH3,
  RiListUnordered,
  RiListOrdered,
  RiCodeBoxLine,
  RiTable2,
  RiDoubleQuotesL,
  RiSeparator,
  RiSparkling2Line,
} from '@remixicon/react';
import type { Editor, Range } from '@tiptap/core';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * Slash command registry
 *
 * Keep this file presentational + declarative. The Tiptap
 * extension (extensions/SlashCommand.ts) imports `SLASH_COMMANDS`
 * and `filterSlashCommands` so the same list drives both
 * rendering AND suggestion.items().
 * ───────────────────────────────────────────────────────────── */

export type SlashCommand = {
  /** Stable id — used as React key */
  id: string;
  /** Primary label shown to the user */
  title: string;
  /** Short helper text underneath */
  subtitle: string;
  /** Icon component (Remix icon) */
  icon: React.ComponentType<{ className?: string }>;
  /** Search aliases, lowercased; title is always matched too */
  aliases: string[];
  /** Runs the Tiptap command after clearing the `/query` range. */
  command: (editor: Editor, range: Range) => void;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'heading-1',
    title: 'Heading 1',
    subtitle: 'Big section heading',
    icon: RiH1,
    aliases: ['h1', 'heading', 'title'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    },
  },
  {
    id: 'heading-2',
    title: 'Heading 2',
    subtitle: 'Medium section heading',
    icon: RiH2,
    aliases: ['h2', 'heading', 'subtitle'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    },
  },
  {
    id: 'heading-3',
    title: 'Heading 3',
    subtitle: 'Small section heading',
    icon: RiH3,
    aliases: ['h3', 'heading'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    },
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    subtitle: 'Unordered list',
    icon: RiListUnordered,
    aliases: ['bullet', 'ul', 'unordered', 'list'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: 'numbered-list',
    title: 'Numbered List',
    subtitle: 'Ordered list',
    icon: RiListOrdered,
    aliases: ['ol', 'ordered', 'numbered', 'list'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    id: 'code-block',
    title: 'Code Block',
    subtitle: 'Fenced code with syntax highlight',
    icon: RiCodeBoxLine,
    aliases: ['code', 'pre', 'fenced'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    id: 'table',
    title: 'Table',
    subtitle: '3×3 with header row',
    icon: RiTable2,
    aliases: ['table', 'grid'],
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    id: 'blockquote',
    title: 'Blockquote',
    subtitle: 'Indented quote',
    icon: RiDoubleQuotesL,
    aliases: ['quote', 'blockquote', 'cite'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    id: 'divider',
    title: 'Divider',
    subtitle: 'Horizontal rule',
    icon: RiSeparator,
    aliases: ['hr', 'rule', 'separator', 'divider'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    id: 'ai-highlight',
    title: 'AI Highlight',
    subtitle: 'Mark text as AI-sourced',
    icon: RiSparkling2Line,
    // Note: we deliberately keep "ai"/"mark"/"sparkle" as aliases but do
    // NOT include "highlight" — `/h` should land on headings, not a
    // selection-only mark. Use `/ai` or `/hi` (substring) to surface.
    aliases: ['ai', 'sparkle'],
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHighlight({ color: 'ai' })
        .run();
    },
  },
];

/**
 * Filter rules (per spec):
 *   - Match if the command **title starts with** the query (case-insensitive).
 *   - Match if any alias starts with the query.
 *
 * Strict title-prefix matching ensures `/h` surfaces only Heading 1/2/3
 * (title-prefix match) and items whose alias starts with "h" (e.g.
 * "hr" alias on Divider). It excludes incidental substring matches
 * like "AI Highlight".
 * Empty query returns the full list.
 */
export function filterSlashCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((cmd) => {
    if (cmd.title.toLowerCase().startsWith(q)) return true;
    return cmd.aliases.some((a) => a.startsWith(q));
  });
}

/* ─────────────────────────────────────────────────────────────
 * Menu component
 * ───────────────────────────────────────────────────────────── */

export type SlashCommandMenuProps = {
  items: SlashCommand[];
  /** Called when user picks an item (click or Enter). */
  onSelect: (cmd: SlashCommand) => void;
  /** Currently highlighted row index (controlled by parent for keyboard nav). */
  activeIndex: number;
  /** Updates activeIndex (used on hover) */
  onHoverIndex?: (index: number) => void;
};

export const SlashCommandMenu = React.forwardRef<HTMLDivElement, SlashCommandMenuProps>(
  function SlashCommandMenu({ items, onSelect, activeIndex, onHoverIndex }, ref) {
    // Auto-scroll the active row into view when it changes (keyboard nav)
    const listRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const el = listRef.current?.querySelector<HTMLElement>(
        `[data-slash-index="${activeIndex}"]`,
      );
      el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    return (
      <div
        ref={ref}
        data-kb-part="slash-command-menu"
        role="listbox"
        aria-label="Insert block"
        className={cn(
          'min-w-[220px] max-w-[320px] rounded-[8px] border border-[#e2e8f0] bg-white',
          'shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.06)]',
          'py-1 overflow-hidden',
          // Prevent the editor from regaining focus when clicking a row; we
          // re-focus via the Tiptap command after mutation.
          'z-[60]',
        )}
      >
        {items.length === 0 ? (
          <div className="px-3 py-2 text-[13px] leading-5 text-[#64758b]">No results</div>
        ) : (
          <div ref={listRef} className="max-h-[280px] overflow-y-auto">
            {items.map((cmd, i) => {
              const Icon = cmd.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  data-slash-index={i}
                  // Prevent the mousedown from blurring the editor before
                  // onClick fires; onMouseDown default = focus shift.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => onHoverIndex?.(i)}
                  onClick={() => onSelect(cmd)}
                  className={cn(
                    'flex w-full items-start gap-2.5 px-2.5 py-1.5 text-left',
                    'focus-visible:outline-none',
                    isActive ? 'bg-[#f8fafc]' : 'bg-transparent',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#475569]',
                      '[&>svg]:h-4 [&>svg]:w-4',
                    )}
                  >
                    <Icon />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[14px] font-medium leading-5 text-[#0f172a]">
                      {cmd.title}
                    </span>
                    <span className="text-[12px] font-normal leading-[18px] text-[#64758b]">
                      {cmd.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
