// Rail glyph provenance: all four nav icons extracted from Figma
// `9aGp5t9fH1d0PXi4LMhOdb` node `1:4324` (page 0:1 "side-nav" → "option 12").
// The AI slot renders <AiIcon /> (gradient sparkle) sourced from vector node
// `I1:4349;206:6843;12619:15996;517:21335`. Other rail slots use Remix
// (@remixicon/react) regular-weight Line icons at 16×16.
import { cn } from '../../utils/cn';

export type NavRailItem = {
  id: string;
  icon: React.ReactNode;
  label?: string;
};

export type SideNavRailProps = {
  items: NavRailItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  theme?: 'dark' | 'light';
  brandLogo?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  className?: string;
};

export function SideNavRail({
  items,
  activeId,
  onItemClick,
  theme = 'dark',
  brandLogo,
  bottomSlot,
  className,
}: SideNavRailProps) {
  const isDark = theme === 'dark';

  return (
    <nav
      className={cn(
        'flex h-full w-[54px] flex-col',
        isDark ? 'bg-[#1a1a1a]' : 'bg-white border-r border-[#e2e8f0]',
        className,
      )}
      aria-label="Primary"
      data-kb-component="side-nav-rail"
    >
      {brandLogo !== undefined && (
        <div
          data-kb-part="rail-header"
          className="flex size-[54px] items-center justify-center shrink-0"
        >
          {brandLogo}
        </div>
      )}

      {/* Inset 1px divider at Y=54 — 8L / 8R inset (effective width 38) */}
      <div
        data-kb-part="rail-divider"
        className={cn(
          'h-px mx-[8px] shrink-0',
          isDark ? 'bg-white/10' : 'bg-[#e2e8f0]',
        )}
      />

      <div
        data-kb-part="rail-stack"
        className="flex-1 flex flex-col gap-[2px] pt-[12px] pb-[6px]"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label ?? item.id}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onItemClick?.(item.id)}
              data-kb-part="rail-item"
              className={cn(
                // 42 × 36 hit area, centered in 54 rail (6L / 6R gutter)
                'flex h-9 items-center justify-center mx-[6px] rounded-[8px] transition-colors duration-150 cursor-pointer',
                isDark
                  ? isActive
                    ? 'bg-[rgba(255,255,255,0.10)] text-white'
                    : 'text-white/50 hover:bg-[rgba(255,255,255,0.06)] hover:text-white/80'
                  : isActive
                    ? 'bg-[#f8fafc] text-[#0f172a]'
                    : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]',
              )}
            >
              {/* Enforce 16×16 glyph in-component so size is not caller-dependent.
                  Any SVG/img dropped into `icon` is forced to 16×16 here. */}
              <span className="flex size-4 items-center justify-center [&>svg]:w-4 [&>svg]:h-4 [&>img]:w-4 [&>img]:h-4">{item.icon}</span>
            </button>
          );
        })}
      </div>

      {bottomSlot !== undefined && (
        <div className="flex h-10 w-[54px] items-center justify-center shrink-0 mb-2">
          {bottomSlot}
        </div>
      )}
    </nav>
  );
}
