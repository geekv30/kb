import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

/**
 * Placement names are the live app's tooltip classNames. Geometry is
 * copied from the live `Jo` styled tooltip (main bundle module 9562):
 * each placement sets left/top/transform on the bubble and positions a
 * 6px CSS-triangle arrow.
 */
export type TooltipPlacement =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  /** Not in the live set: below the trigger, right edges aligned, for controls at the viewport's right edge. */
  | 'bottom-end';

const BUBBLE_POSITION: Record<TooltipPlacement, CSSProperties> = {
  'bottom-center': { left: '50%', top: '125%', transform: 'translateX(-50%)' },
  'bottom-left': { left: 0, top: '150%', transform: 'translateX(-13px)' },
  'bottom-right': { transform: 'translateX(-72%) translateY(75%)' },
  'top-left': { top: 0, transform: 'translateX(-13px) translateY(-110%)' },
  'top-center': { left: '50%', transform: 'translateX(-50%) translateY(-110%)' },
  'top-right': { top: 0, transform: 'translateX(-91%) translateY(-110%)' },
  'bottom-end': { right: 0, top: 'calc(100% + 8px)' },
};

const ARROW_X: Record<TooltipPlacement, CSSProperties> = {
  'bottom-center': { left: '50%' },
  'bottom-left': { left: 20 },
  'bottom-right': { right: 10 },
  'top-left': { left: 20 },
  'top-center': { left: '50%' },
  'top-right': { right: 10 },
  'bottom-end': { right: 20 },
};

function arrowStyle(placement: TooltipPlacement): CSSProperties {
  const pointsDown = placement.startsWith('top');
  return {
    ...ARROW_X[placement],
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: 6,
    borderBottomColor: 'var(--color-legacy-tooltip)',
    marginLeft: -6,
    pointerEvents: 'none',
    ...(pointsDown ? { transform: 'rotate(180deg)', bottom: -12 } : { bottom: '100%' }),
  };
}

const BUBBLE_CLASSES =
  'absolute z-[100] h-max w-max cursor-default rounded-[4px] bg-legacy-tooltip px-[10px] py-[5px] text-left font-inter text-[12px] leading-[18px] font-normal text-legacy-tooltip-text break-all whitespace-pre-wrap';

interface TooltipBubbleProps {
  id: string;
  content: ReactNode;
  placement: TooltipPlacement;
  maxWidth: number;
  style?: CSSProperties;
}

function TooltipBubble({ id, content, placement, maxWidth, style }: TooltipBubbleProps) {
  return (
    <span
      id={id}
      role="tooltip"
      className={BUBBLE_CLASSES}
      style={{ maxWidth, textWrap: 'wrap', ...BUBBLE_POSITION[placement], ...style } as CSSProperties}
    >
      <span aria-hidden style={arrowStyle(placement)} />
      {content}
    </span>
  );
}

/** Live hover delay before a tooltip (and hover-swap image) appears. */
const SHOW_DELAY_MS = 200;

function useDelayedHover(delay: number) {
  const [shown, setShown] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShown(true), delay);
  }, [delay]);
  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setShown(false);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { shown, show, hide };
}

export interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  /** Live `size` prop; caps bubble width. */
  maxWidth?: number;
  className?: string;
  /** Render prop receives the shown state (for live hover-swap images). */
  children: ReactNode | ((shown: boolean) => ReactNode);
}

/**
 * Anchored tooltip (live `H.Ay`): a `relative flex` wrapper with the
 * bubble absolutely positioned against it. Opens on hover after 200ms
 * and on keyboard focus.
 */
export function Tooltip({
  content,
  placement = 'bottom-center',
  maxWidth = 250,
  className,
  children,
}: TooltipProps) {
  const id = useId();
  const { shown, show, hide } = useDelayedHover(SHOW_DELAY_MS);
  return (
    <span
      className={cn('relative m-0 flex cursor-pointer', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={shown ? id : undefined}
    >
      {typeof children === 'function' ? children(shown) : children}
      {shown && content ? (
        <TooltipBubble id={id} content={content} placement={placement} maxWidth={maxWidth} />
      ) : null}
    </span>
  );
}

export interface FixedTooltipProps {
  content: ReactNode;
  maxWidth?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Portaled tooltip used by sidebar rows (live module 3713). The bubble
 * is `position: fixed` at the trigger's top-right corner, shifted
 * `translateX(-20px) translateY(calc(-100% - 20px))`, with the
 * `top-left` arrow. Portaling escapes the sidebar's `overflow: hidden`.
 */
export function FixedTooltip({ content, maxWidth = 150, className, children }: FixedTooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setAnchor({ top: rect.top, left: rect.right });
  };
  const close = () => setAnchor(null);
  return (
    <span
      ref={triggerRef}
      className={cn('relative flex', className)}
      onMouseEnter={open}
      onMouseLeave={close}
      aria-describedby={anchor ? id : undefined}
    >
      {children}
      {anchor && content
        ? createPortal(
            <TooltipBubble
              id={id}
              content={content}
              placement="top-left"
              maxWidth={maxWidth}
              style={{
                position: 'fixed',
                zIndex: 1000,
                top: anchor.top,
                left: anchor.left,
                transform: 'translateX(-20px) translateY(calc(-100% - 20px))',
              }}
            />,
            document.body,
          )
        : null}
    </span>
  );
}

export interface TooltipIconButtonProps {
  label: string;
  /** Tooltip text; defaults to `label`. */
  content?: ReactNode;
  src: string;
  /** Live hover-swap image, shown once the tooltip opens. */
  hoverSrc?: string;
  size: number;
  placement?: TooltipPlacement;
  onClick?: () => void;
  className?: string;
}

/** Live `H.Ay` with an `image` prop: an icon that swaps on hover. */
export function TooltipIconButton({
  label,
  content,
  src,
  hoverSrc,
  size,
  placement,
  onClick,
  className,
}: TooltipIconButtonProps) {
  return (
    <Tooltip content={content ?? label} placement={placement} className={className}>
      {(shown) => (
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="m-0 flex cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:rounded-full focus-visible:shadow-[0_0_0_2px_#1473e6]"
        >
          <img src={hoverSrc && shown ? hoverSrc : src} alt="" width={size} height={size} draggable={false} />
        </button>
      )}
    </Tooltip>
  );
}
