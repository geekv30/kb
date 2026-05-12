// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (3×4 card grid — active + accepted + dismissed)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16926 (active Addition in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16342 (active Replace in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:15737 (active Removal in context)
import * as React from 'react';
import {
  Check,
  XClose,
  Plus,
  RefreshCcw01,
  File04,
  ReverseLeft,
} from '@untitledui/icons';
import { cn } from '../../utils/cn';
import { tokens } from '../../tokens';
import { AICard } from './AICard';
import { NavArrow } from './NavArrow';
import type {
  AISuggestion,
  AISuggestionState,
  AISuggestionType,
} from './ai-suggestion-types';

export type SuggestionTypeMeta = {
  label: string;
  color: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export type AIGapSuggestionCardProps = {
  suggestion: AISuggestion;
  state: AISuggestionState;
  onPrev?: () => void;
  onNext?: () => void;
  onOpenSources?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUndo?: (id: string) => void;
  className?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  decisionLabels?: { accepted: string; dismissed: string };
  typeRegistry?: Record<string, SuggestionTypeMeta>;
};

/* ─────────────────────────────────────────────────────────────
 * Type chip — color-coded label + glyph per suggestion type.
 *
 * Hex literals mirrored 1:1 in tokens.css (--color-ai-addition /
 * -replace / -removal). Inline because Tailwind arbitrary classes
 * for dynamic per-type color don't tree-shake via the inline
 * style path used here, and the same literals also feed inline
 * SVG fill.
 * ───────────────────────────────────────────────────────────── */

export const DEFAULT_GAP_TYPES: Record<string, SuggestionTypeMeta> = {
  addition: { label: 'Addition', color: tokens.color.aiAddition, Icon: Plus },
  replace: { label: 'Replace', color: tokens.color.aiReplace, Icon: RefreshCcw01 },
  removal: { label: 'Removal', color: tokens.color.aiRemoval, Icon: XClose },
};

function TypeChip({
  type,
  registry,
}: {
  type: AISuggestionType;
  registry: Record<string, SuggestionTypeMeta>;
}) {
  const meta = registry[type];
  if (!meta) {
    return (
      <span
        data-kb-part="ai-gap-type-chip"
        data-kb-type={type}
        className="inline-flex items-center gap-1"
        style={{ color: tokens.color.textDisabled }}
      >
        <span className="text-[12px] font-medium leading-[18px]">{type}</span>
      </span>
    );
  }
  const { label, color, Icon } = meta;
  return (
    <span
      data-kb-part="ai-gap-type-chip"
      data-kb-type={type}
      className="inline-flex items-center gap-1"
      style={{ color }}
    >
      <Icon className="h-[14px] w-[14px]" />
      <span className="text-[12px] font-medium leading-[18px]">{label}</span>
    </span>
  );
}

function SourcesButton({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] px-1.5 py-1',
        // Per Figma `ai-gap-active-addition.png` — '4 Sources' is
        // weight=normal, not medium. Lighter weight also improves
        // visual baseline alignment with the icon + adjacent NavArrow
        // / accept-reject pills (medium gave a heavier optical feel).
        'text-[14px] font-normal leading-[20px] text-text-meta',
        'transition-colors hover:bg-surface-muted hover:text-text-primary',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <File04 aria-hidden="true" className="h-4 w-4" />
      <span>{count} Sources</span>
    </button>
  );
}

function RejectButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Reject suggestion"
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-btn-danger-bg)]',
        // Hover bg derived from --color-ai-removal (#d52c1f) at ~12% over white.
        'text-ai-removal transition-colors hover:bg-[#fad9d6]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <XClose aria-hidden="true" className="h-[14px] w-[14px]" />
    </button>
  );
}

function AcceptButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Accept suggestion"
      className={cn(
        // Figma 74:10490 — bg=background/neutral/subtle (#f1f5f9),
        // icon=icon/neutral/default (#0f172a). Same pill shape as
        // the reject button (rounded-full). Hover deepens the bg one
        // step to keep affordance visible on the light fill.
        'inline-flex size-6 items-center justify-center rounded-full bg-surface-muted',
        'text-text-primary transition-colors hover:bg-card-border',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <Check aria-hidden="true" className="h-[14px] w-[14px]" />
    </button>
  );
}

export function AIGapSuggestionCard({
  suggestion,
  state,
  onPrev,
  onNext,
  onOpenSources,
  onAccept,
  onReject,
  onUndo,
  className,
  actions,
  meta,
  decisionLabels,
  typeRegistry,
}: AIGapSuggestionCardProps) {
  const resolvedRegistry = typeRegistry ?? DEFAULT_GAP_TYPES;
  if (state !== 'active') {
    const decisionLabel =
      state === 'accepted'
        ? (decisionLabels?.accepted ?? 'ACCEPTED')
        : (decisionLabels?.dismissed ?? 'DISMISSED');
    return (
      <AICard
        mode="collapsed"
        className={className}
        data-kb-component="ai-gap-suggestion-card"
        data-kb-state={state}
        data-kb-type={suggestion.type}
      >
        <TypeChip type={suggestion.type} registry={resolvedRegistry} />
        <span aria-hidden className="mx-3 h-4 w-px shrink-0 bg-card-divider" />
        <span className="text-[12px] font-medium leading-[18px] text-text-meta tracking-wide">
          {decisionLabel}
        </span>
        <button
          type="button"
          onClick={() => onUndo?.(suggestion.id)}
          aria-label={`Undo ${state} for ${suggestion.title}`}
          className={cn(
            'ml-auto inline-flex size-6 items-center justify-center rounded-[4px]',
            'text-text-muted transition-colors',
            'hover:bg-surface-muted hover:text-text-primary',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
          )}
        >
          <ReverseLeft aria-hidden="true" className="h-4 w-4" />
        </button>
      </AICard>
    );
  }

  return (
    <AICard
      mode="active"
      className={className}
      data-kb-component="ai-gap-suggestion-card"
      data-kb-state="active"
      data-kb-type={suggestion.type}
      header={<TypeChip type={suggestion.type} registry={resolvedRegistry} />}
      body={
        <>
          {meta}
          <h3
            data-kb-part="ai-gap-title"
            className="mt-2 text-[14px] font-medium leading-[20px] text-text-primary"
          >
            {suggestion.title}
          </h3>
          <p
            data-kb-part="ai-gap-description"
            className="mt-1 text-[14px] font-normal leading-[20px] text-text-muted"
          >
            {suggestion.description}
          </p>
        </>
      }
      showFooterDivider
      footer={
        actions !== undefined ? (
          actions
        ) : (
          <>
            <div className="flex items-center gap-1">
              <NavArrow direction="up" onClick={onPrev} />
              <NavArrow direction="down" onClick={onNext} />
            </div>
            <div className="flex items-center gap-2">
              <SourcesButton
                count={suggestion.sourceCount}
                onClick={() => onOpenSources?.(suggestion.id)}
              />
              <RejectButton onClick={() => onReject?.(suggestion.id)} />
              <AcceptButton onClick={() => onAccept?.(suggestion.id)} />
            </div>
          </>
        )
      }
    />
  );
}
