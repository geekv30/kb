// Figma: 9aGp5t9fH1d0PXi4LMhOdb#74:9431 (3×4 card grid — active + accepted + dismissed)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16926 (active Addition in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:16342 (active Replace in context)
//        9aGp5t9fH1d0PXi4LMhOdb#81:15737 (active Removal in context)
import * as React from 'react';
import {
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
  RiRefreshLine,
  RiFileTextLine,
  RiArrowGoBackLine,
} from '@remixicon/react';
import { cn } from '../../utils/cn';
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
  addition: { label: 'Addition', color: '#086e3f', Icon: RiAddLine },
  replace: { label: 'Replace', color: '#065b89', Icon: RiRefreshLine },
  removal: { label: 'Removal', color: '#d52c1f', Icon: RiCloseLine },
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
        style={{ color: '#94a3b8' }}
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
        'text-[14px] font-medium leading-[20px] text-[#475569]',
        'transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <RiFileTextLine aria-hidden="true" className="h-4 w-4" />
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
      <RiCloseLine aria-hidden="true" className="h-[14px] w-[14px]" />
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
        'inline-flex size-6 items-center justify-center rounded-full bg-[#f1f5f9]',
        'text-[#0f172a] transition-colors hover:bg-[#e2e8f0]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
      )}
    >
      <RiCheckLine aria-hidden="true" className="h-[14px] w-[14px]" />
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
        <span className="text-[12px] font-medium leading-[18px] text-[#475569] tracking-wide">
          {decisionLabel}
        </span>
        <button
          type="button"
          onClick={() => onUndo?.(suggestion.id)}
          aria-label={`Undo ${state} for ${suggestion.title}`}
          className={cn(
            'ml-auto inline-flex size-6 items-center justify-center rounded-[4px]',
            'text-[#64758b] transition-colors',
            'hover:bg-[#f1f5f9] hover:text-[#0f172a]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10',
          )}
        >
          <RiArrowGoBackLine aria-hidden="true" className="h-4 w-4" />
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
            className="mt-2 text-[14px] font-medium leading-[20px] text-[#0f172a]"
          >
            {suggestion.title}
          </h3>
          <p
            data-kb-part="ai-gap-description"
            className="mt-1 text-[14px] font-normal leading-[20px] text-[#64758b]"
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
