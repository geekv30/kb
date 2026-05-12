# Modal

**Figma**: `https://figma.com/design/251DTRmxl2L6jmXd3FWzHe/kb-revamp?node-id=2111-1955`
**Primary node**: `2111:1955` ("Convert to External KB?" reference)
**Component set**: `_Modal-Title` (header) + `_Modal-Actions` (footer) — composition
**Storybook target**: `packages/kb-ui/src/components/overlays/Modal.tsx`
**Story**: `Components/Overlays/Modal` → Playground

> Canonical centered-overlay primitive. Built on Radix Dialog. Mirrors `SideSheet`'s portal/inline duality so a Modal can also be hosted inside a non-portal pane (e.g. review canvas).

## Anatomy

384-wide centered card on a dimmed backdrop. Composition slots:

1. **Header** (`_Modal-Title`) — `bg-surface-subtle`, bottom divider, hosts optional 16px icon + title + optional trailing slot.
2. **Body** — flex column with 16px padding + 16px gap. Receives `children`.
3. **Footer** (`_Modal-Actions`) — right-aligned action row at the bottom of the body container, 8px top gap on top of the body's existing 16px gap (total 24px above the actions).

## Frame tokens

| Property | Value | Token |
|---|---|---|
| width (default) | 384px | — (override via `width` prop) |
| radius | 8px | `scale/radius/lg` |
| bg | `#ffffff` | `text/white/adaptive` |
| border | 1px `#e2e8f0` (inside) | `border-card-border` (Figma `#e5e5e5` mapped here — one slate step) |
| shadow | `0 24px 48px rgba(15,23,42,0.20)` | — |
| overlay bg | `bg-text-primary/40` | — |
| overlay z-index | 90 | — |
| content z-index | 91 | — |

## Header (`_Modal-Title`)

| Property | Value | Token |
|---|---|---|
| bg | `#f8fafc` | `surface-subtle` / `background/neutral/faint` |
| border-bottom | 1px `#e2e8f0` | `border-card-border` |
| padding | 12 TB, 16 LR | `scale/space/xl` / `scale/space/2xl` |
| corners | top 8/8, bottom 0/0 | — |
| layout | flex, justify-between, items-center, gap 8 | — |
| icon size | 16×16 | — |
| title | 16/24 Inter Medium `#0f172a` | `text-text-primary` |
| trailing slot | optional, right-aligned | — |

## Body

| Property | Value | Token |
|---|---|---|
| padding | 16 all | `scale/space/2xl` |
| gap | 16 between direct children | `scale/space/2xl` |
| layout | flex column | — |

The footer slot (when used) renders as the last body child with an extra `pt-2` (8px) — total 24px above the actions row.

## Footer (`_Modal-Actions`)

| Property | Value | Token |
|---|---|---|
| top padding | 8 | `scale/space/lg` |
| layout | flex, items-end, justify-end, gap 8 | — |
| typical content | subtle Cancel + primary Confirm | `Button` primitive |

## Props

```ts
export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  titleIcon?: React.ReactNode;
  titleTrailing?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;        // default 384
  className?: string;
  inline?: boolean;      // default false; mirrors SideSheet inline mode
};
```

## Behavior

- **Portal mode** (default): centered modal with Radix focus trap, Esc-to-close, overlay-click-to-close.
- **Inline mode**: chrome rendered in place; consumer owns close behavior.
- **A11y**: when `title` is provided it becomes the `Dialog.Title`; otherwise a visually-hidden fallback title satisfies Radix's a11y requirement.
- **Animation**: 200ms `animate-toast-in` entrance (kb-ui's tokens.css ships the `kb-toast-in` keyframes).

## Consumers (as of 2026-05-12)

- `apps/demo/src/components/ConfirmDialog.tsx` — thin wrapper that maps `title` / `message` / `confirmLabel` / `cancelLabel` / `confirmVariant` to Modal's slots.
- `apps/demo/src/components/ShortcutsCheatSheet.tsx` — `?` help overlay; uses `titleTrailing` for the close X, width 480 for the two-column shortcuts layout.

## Notes / gaps

- No `maxHeight` prop yet. If a consumer needs scrollable body content for tall modals, they can wrap children in a scroll container; or a future iteration can add `maxHeight` as a top-level prop.
- The `titleTrailing` slot is currently the only way to render a close X. The canonical Figma example (`2111:1955`) does NOT show a close X — only Cancel + Confirm at the footer. Use `titleTrailing` sparingly (e.g. for non-confirmation modals like the cheat sheet).
