// ShortcutsModal — generic keyboard cheat-sheet overlay.
//
// Renders a kb-ui `Modal` with a header (title + close X), an optional
// intro paragraph, and one `<section>` per shortcut group. Each row is
// `[label] [keys]` with keys rendered as `Kbd` chips.
//
// The library's responsibility ends at "render a modal given groups
// data" — app-side glue (custom events, hotkey bindings, where the
// catalog lives) stays in the consumer.

import * as React from 'react';
import { XClose } from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { Modal } from './Modal';
import { Kbd } from '../primitives/Kbd';

/* ─────────────────────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────────────────────── */

export type Shortcut = { keys: string[]; label: string };

export type ShortcutGroup = { title: string; items: Shortcut[] };

export type ShortcutsModalProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  groups: ShortcutGroup[];
  /** Title shown in the modal header. Defaults to 'Keyboard shortcuts'. */
  title?: string;
  /**
   * Optional intro line shown above the groups. Pass a node to allow
   * inline `<Kbd>` chips inside the copy. Defaults to undefined (no intro).
   */
  intro?: React.ReactNode;
};

/* ─────────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────────── */

export function ShortcutsModal({
  open,
  onOpenChange,
  groups,
  title = 'Keyboard shortcuts',
  intro,
}: ShortcutsModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      width={480}
      title={title}
      titleTrailing={
        <button
          type="button"
          aria-label="Close shortcuts"
          onClick={() => onOpenChange(false)}
          className={cn(
            'shrink-0 rounded-[4px] p-1 text-text-muted',
            'hover:bg-surface-muted hover:text-text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
          )}
        >
          <XClose aria-hidden="true" className="h-4 w-4" />
        </button>
      }
    >
      {intro !== undefined && (
        <p className="text-[13px] leading-5 text-text-muted">{intro}</p>
      )}

      <div className="flex flex-col gap-5">
        {groups.map((group) => {
          const headingId = `shortcut-group-${slug(group.title)}`;
          return (
            <section key={group.title} aria-labelledby={headingId}>
              <h3
                id={headingId}
                className="text-[11px] font-semibold uppercase tracking-wide text-text-muted"
              >
                {group.title}
              </h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {group.items.map((s, i) => (
                  <li
                    key={`${group.title}-${i}`}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[14px] leading-5 text-text-primary">
                      {s.label}
                    </span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, ki) => (
                        <Kbd key={ki}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Modal>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
