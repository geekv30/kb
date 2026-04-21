import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { VirtualElement } from '@floating-ui/dom';
import { createRoot, type Root } from 'react-dom/client';
import * as React from 'react';
import {
  SlashCommandMenu,
  SLASH_COMMANDS,
  filterSlashCommands,
  type SlashCommand as SlashCommandItem,
} from '../SlashCommandMenu';

/* ─────────────────────────────────────────────────────────────
 * Tiptap Extension — SlashCommand
 *
 * Registers `/` as a trigger via @tiptap/suggestion. Renders a
 * floating React popup anchored to the caret using floating-ui.
 *
 * Tiptap 3 does NOT ship tippy.js; @floating-ui/dom is already a
 * transitive dep (bubble menu uses it), so we reuse it.
 *
 * Behavior:
 *  - Opens on `/` at the start of any text node (allowedPrefixes
 *    includes the usual suspects so mid-word "/" does not trigger).
 *  - Filters items by typed query (title + alias match).
 *  - Arrow keys navigate, Enter selects, Escape closes.
 *  - Clicking outside closes (suggestion onExit handles it).
 *  - Disabled inside code blocks via `allow()`.
 * ───────────────────────────────────────────────────────────── */

type SlashSuggestionProps = {
  editor: Editor;
  range: Range;
  query: string;
  text: string;
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect?: (() => DOMRect | null) | null;
};

type SlashKeyDownProps = {
  event: KeyboardEvent;
};

/**
 * Singleton React-rendered popup host.
 * A minimal controller that owns the DOM element + React root and
 * positions itself via floating-ui against the caret rect provided
 * by Tiptap's suggestion API.
 */
class SlashPopup {
  private el: HTMLDivElement;
  private root: Root;
  private visible = false;
  private items: SlashCommandItem[] = [];
  private activeIndex = 0;
  private props: SlashSuggestionProps | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.setAttribute('data-kb-slash-popup', '');
    this.el.style.position = 'absolute';
    this.el.style.top = '0';
    this.el.style.left = '0';
    this.el.style.zIndex = '60';
    this.el.style.pointerEvents = 'none'; // children re-enable
    this.root = createRoot(this.el);
  }

  show(props: SlashSuggestionProps) {
    this.props = props;
    this.items = props.items;
    this.activeIndex = 0;
    if (!this.visible) {
      document.body.appendChild(this.el);
      this.visible = true;
    }
    this.render();
    this.position();
  }

  update(props: SlashSuggestionProps) {
    this.props = props;
    // Keep activeIndex in range after filter changes
    const prev = this.items;
    this.items = props.items;
    if (
      this.activeIndex >= this.items.length ||
      (prev[this.activeIndex] &&
        this.items[this.activeIndex]?.id !== prev[this.activeIndex].id)
    ) {
      this.activeIndex = 0;
    }
    this.render();
    this.position();
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    // Unmount react content but keep the node reusable
    this.root.render(null);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }

  /** True iff a key was handled (returning true tells Tiptap to stopPropagation). */
  onKeyDown({ event }: SlashKeyDownProps): boolean {
    if (!this.visible || !this.props) return false;
    if (event.key === 'ArrowDown') {
      if (this.items.length === 0) return true;
      this.activeIndex = (this.activeIndex + 1) % this.items.length;
      this.render();
      return true;
    }
    if (event.key === 'ArrowUp') {
      if (this.items.length === 0) return true;
      this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
      this.render();
      return true;
    }
    if (event.key === 'Enter') {
      if (this.items.length === 0) return true; // swallow Enter on empty results
      const cmd = this.items[this.activeIndex];
      if (cmd) this.props.command(cmd);
      return true;
    }
    if (event.key === 'Escape') {
      // Let Tiptap's suggestion plugin process Escape to dismiss itself.
      // We return false so it still bubbles to suggestion's handler.
      return false;
    }
    return false;
  }

  private position() {
    if (!this.props?.clientRect) return;
    const rect = this.props.clientRect();
    if (!rect) return;

    const virtual: VirtualElement = {
      getBoundingClientRect: () => rect,
      contextElement: document.body,
    };

    computePosition(virtual, this.el, {
      placement: 'bottom-start',
      middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      this.el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      this.el.style.top = '0';
      this.el.style.left = '0';
    });
  }

  private render() {
    if (!this.props) return;
    const { command } = this.props;
    this.root.render(
      React.createElement(
        'div',
        { style: { pointerEvents: 'auto' } },
        React.createElement(SlashCommandMenu, {
          items: this.items,
          activeIndex: this.activeIndex,
          onHoverIndex: (i: number) => {
            this.activeIndex = i;
            this.render();
          },
          onSelect: (item: SlashCommandItem) => command(item),
        }),
      ),
    );
  }
}

/** Build the suggestion render() callbacks over a popup singleton. */
function createRenderer(): NonNullable<SuggestionOptions['render']> {
  return () => {
    const popup = new SlashPopup();
    return {
      onStart: (props) => popup.show(props as SlashSuggestionProps),
      onUpdate: (props) => popup.update(props as SlashSuggestionProps),
      onExit: () => popup.hide(),
      onKeyDown: (props) => popup.onKeyDown({ event: props.event }),
    };
  };
}

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        allowSpaces: false,
        // Only trigger when `/` follows start of node or whitespace,
        // so mid-word URLs ("https://…") don't open the menu.
        allowedPrefixes: [' ', '\n', '\t'],
        // Filter: empty list is "No results" (menu shows that state),
        // so we always return at least []
        items: ({ query }: { query: string }) => filterSlashCommands(query),

        // When the user picks an item, run its Tiptap command.
        // `range` spans from the `/` to the end of the typed query.
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SlashCommandItem;
        }) => {
          props.command(editor, range);
        },

        // Do not open inside a code block / code mark.
        allow: ({ editor }: { editor: Editor }) => {
          if (editor.isActive('codeBlock')) return false;
          if (editor.isActive('code')) return false;
          return true;
        },

        render: createRenderer(),
      } satisfies Partial<SuggestionOptions<SlashCommandItem>>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// Re-export so consumers (e.g. ContentEditor) can use one entry point.
export { SLASH_COMMANDS, filterSlashCommands };
export type { SlashCommandItem };
