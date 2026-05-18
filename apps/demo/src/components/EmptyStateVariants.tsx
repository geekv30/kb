// Empty-state — Round 2 Variant A (winning design).
//
// Template gallery: a centered 2×2 grid of pre-structured article
// templates plus a "browse all" tertiary link. Sits flush on the
// white content surface — no card chrome, no border around the
// gallery itself.
//
// `onCreate` is kept on the prop signature for API parity with
// CategoryPage.tsx (which still passes it). It's intentionally
// unused — the page-header "+ New article" remains the only
// blank-start entrypoint.

import type { ComponentType, CSSProperties, SVGProps } from 'react';
import {
  BookOpen01,
  FileShield02,
  MessageQuestionCircle,
  Tool01,
} from '@untitledui/icons';

export type EmptyStateGalleryProps = {
  /** Kept for API parity with CategoryPage.tsx — intentionally unused. */
  onCreate: () => void;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type TemplateCardProps = {
  Icon: IconComponent;
  title: string;
  description: string;
  /** Accent palette for the icon container. */
  containerClass: string;
  iconClass: string;
  onClick: () => void;
  /**
   * Mount delay in ms, fed to the CSS `--kb-empty-card-delay` variable
   * to produce a staggered entrance across the 2×2 grid. Stagger feels
   * natural; everything-at-once feels cheap (Emil's framework). Kept
   * under 80ms-per-card so the cascade stays under 300ms total — never
   * blocks interaction.
   */
  mountDelayMs: number;
};

function TemplateCard({
  Icon,
  title,
  description,
  containerClass,
  iconClass,
  onClick,
  mountDelayMs,
}: TemplateCardProps) {
  // Per-card delay flows through a CSS var so the shared utility class
  // can drive the stagger without per-card style sheets.
  const style = {
    '--kb-empty-card-delay': `${mountDelayMs}ms`,
  } as CSSProperties;

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cardClass}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${containerClass}`}
      >
        <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-5 text-text-primary">
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-[20px] text-text-muted">
        {description}
      </p>
    </button>
  );
}

// Card class extracted so the `transition-all` → `transition-[transform,box-shadow,border-color]`
// swap and the mount-animation class live in one place. We narrow the
// transition properties because `transition-all` would also animate the
// mount-translate, fighting the keyframe (Emil's checklist: "Specify
// exact properties; avoid transition: all"). The active:scale press
// gives buttons a snappy "heard you" feel.
const cardClass = [
  'group flex cursor-pointer flex-col rounded-[12px] border border-[#e2e8f0]',
  'bg-white p-5 text-left',
  'transition-[transform,box-shadow,border-color] duration-200 ease-out',
  'hover:-translate-y-[1px] hover:border-[#cbd5e1] hover:shadow-sm',
  'active:scale-[0.99] active:transition-none',
  'animate-kb-empty-card-mount',
].join(' ');

export function EmptyStateGallery({
  onCreate: _onCreate,
}: EmptyStateGalleryProps) {
  return (
    <div
      data-route="kb-category-empty-template-gallery"
      className="py-16"
    >
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-8">
        {/* Eyebrow pill */}
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-sky-700">
          Quick start
        </span>

        {/* Headline */}
        <h2 className="text-center text-[24px] font-medium leading-[32px] text-text-primary">
          Start with a template — or write from scratch.
        </h2>

        {/* Subtitle */}
        <p className="max-w-[480px] text-center text-[14px] leading-[22px] text-text-muted">
          Templates are pre-structured drafts. You can edit anything, including
          the structure.
        </p>

        {/* 2×2 template grid.
         * Stagger delays are 0/60/120/180ms — under 80ms-per-card per
         * Emil's stagger guidance, total cascade ≈300ms. Reading order
         * is left-to-right, top-to-bottom (matches users' eye path). */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <TemplateCard
            Icon={BookOpen01}
            title="Step-by-step guide"
            description="Walk users through a multi-step process. Best for onboarding flows, setup guides, integrations."
            containerClass="bg-sky-50 border border-sky-100"
            iconClass="text-sky-600"
            onClick={() => console.log('template:step-by-step-guide')}
            mountDelayMs={0}
          />
          <TemplateCard
            Icon={MessageQuestionCircle}
            title="FAQ collection"
            description="Group common questions with concise answers. Best for support hubs, policy clarifications."
            containerClass="bg-violet-50 border border-violet-100"
            iconClass="text-violet-600"
            onClick={() => console.log('template:faq-collection')}
            mountDelayMs={60}
          />
          <TemplateCard
            Icon={FileShield02}
            title="Policy / overview"
            description="Explain a rule, decision, or principle. Best for HR policies, security overviews, code of conduct."
            containerClass="bg-emerald-50 border border-emerald-100"
            iconClass="text-emerald-600"
            onClick={() => console.log('template:policy-overview')}
            mountDelayMs={120}
          />
          <TemplateCard
            Icon={Tool01}
            title="Troubleshooting"
            description="Diagnose-and-fix format. Best for product issues, error explainers, recovery flows."
            containerClass="bg-amber-50 border border-amber-100"
            iconClass="text-amber-600"
            onClick={() => console.log('template:troubleshooting')}
            mountDelayMs={180}
          />
        </div>

        {/* Browse all templates link */}
        <button
          type="button"
          onClick={() => console.log('all-templates')}
          className="text-[13px] text-[#475569] underline-offset-2 hover:text-[#0f172a] hover:underline"
        >
          Or, browse all templates →
        </button>
      </div>
    </div>
  );
}
