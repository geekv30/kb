import * as React from 'react';
import { Send01, XClose } from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';

export type EditorBreadcrumbActionsProps = {
  onSaveAsDraft?: () => void;
  onPublish?: () => void;
  onClose?: () => void;
  /** When true, Publish is disabled. By default also mutes Save as draft (lockstep) — pass `saveDisabled` explicitly to override. */
  publishDisabled?: boolean;
  /** When set, controls the Save-as-draft disabled state independently of `publishDisabled`. Falls back to `publishDisabled` when undefined. */
  saveDisabled?: boolean;
  /** Override the default 'Save as draft' label. */
  saveLabel?: string;
  /** Override the default 'Publish' label. */
  publishLabel?: string;
  className?: string;
};

/**
 * Save-as-draft / Publish / Close action trio used by the editor variant of
 * `KBBreadcrumbBar`. Lifted as a sibling export so consumers can pass a
 * custom action bar via the (forthcoming) `actions` slot without re-deriving
 * the styling.
 *
 * The lifted JSX is byte-identical to today's `variant='editor'` actions:
 * same Button primary variant for Publish, same Send01 / XClose
 * icons at the same sizes, same Save-mute-when-Publish-disabled lockstep,
 * same `gap-2` between controls.
 */
export function EditorBreadcrumbActions({
  onSaveAsDraft,
  onPublish,
  onClose,
  publishDisabled = false,
  saveDisabled,
  saveLabel = 'Save as draft',
  publishLabel = 'Publish',
  className,
}: EditorBreadcrumbActionsProps): JSX.Element {
  const effectiveSaveDisabled = saveDisabled ?? publishDisabled;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/*
        "Save as draft" mutes whenever Publish is disabled — i.e. no
        suggestions accepted yet, so there is nothing meaningful to
        persist as a draft. Default ( publishDisabled === false ) keeps
        the original Phase 5 editor styling and click behaviour.
      */}
      <button
        type="button"
        onClick={onSaveAsDraft}
        disabled={effectiveSaveDisabled}
        className={cn(
          'inline-flex items-center h-8 px-3 py-1.5 rounded-[6px] text-[14px] font-normal',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint',
          effectiveSaveDisabled
            ? 'text-text-disabled cursor-not-allowed'
            : 'text-text-meta hover:bg-surface-subtle',
        )}
      >
        {saveLabel}
      </button>
      {/*
        Publish — Figma `53:8464` uses `bg-black` + `text-white` with a
        white send-plane icon (14 px). Match the `Button` primary variant
        (bg-black, text-white, rounded-6, px-3 py-1.5, text-14/medium).
        Icon color inherits from text via `currentColor`.
      */}
      <Button
        variant="primary"
        onClick={onPublish}
        disabled={publishDisabled}
        icon={<Send01 size={14} />}
      >
        {publishLabel}
      </Button>
      {/*
        Close button — square subtle pill matching `Button` variant="subtle"
        coloring (`bg-[#f1f5f9]`, hover `#e2e8f0`). Sampled from Figma
        `kb-breadcrumb-bar.png` — the close button has a visible idle bg
        of #f1f5f9 (was previously transparent). Per memory rule:
        secondary buttons are `bg-[#f1f5f9]`, not `bg-black`.
      */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="inline-flex size-8 items-center justify-center rounded-[6px] bg-surface-muted text-text-primary hover:bg-card-border focus:outline-none focus-visible:ring-2 focus-visible:ring-border-faint"
      >
        <XClose size={16} />
      </button>
    </div>
  );
}
