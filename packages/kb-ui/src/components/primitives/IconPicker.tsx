import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  // Files & folders (~15)
  Folder,
  FolderPlus,
  FolderClosed,
  FolderCheck,
  FolderSearch,
  FolderShield,
  File02,
  File04,
  File06,
  FileCheck02,
  FileSearch02,
  FilePlus02,
  FileLock02,
  FileX02,
  FileCode01,
  // Comms (~15)
  Mail01,
  Mail02,
  Mail03,
  MessageSquare01,
  MessageSquare02,
  MessageChatCircle,
  MessageTextCircle01,
  MessageDotsCircle,
  MessageHeartCircle,
  Phone01,
  PhoneCall01,
  Send01,
  Inbox01,
  Inbox02,
  AtSign,
  Announcement01,
  // Charts & data (~15)
  BarChart01,
  BarChart04,
  BarChart07,
  BarChartSquare02,
  BarChartSquareUp,
  LineChartUp01,
  LineChartUp02,
  LineChartDown02,
  PieChart01,
  PieChart03,
  TrendUp01,
  TrendDown01,
  Activity,
  Speedometer01,
  Database01,
  // Tools & settings (~15)
  Settings01,
  Settings02,
  Tool01,
  Tool02,
  Sliders01,
  Sliders02,
  FilterFunnel01,
  FilterLines,
  Wifi,
  Key01,
  Lock01,
  LockUnlocked01,
  Shield01,
  ShieldTick,
  Eye,
  // Layout (~15)
  Grid01,
  Grid03,
  LayoutGrid01,
  LayoutGrid02,
  LayoutLeft,
  LayoutRight,
  LayoutTop,
  LayoutBottom,
  Rows01,
  Rows02,
  Columns01,
  Columns02,
  List,
  Menu01,
  DotsGrid,
  // Status (~15)
  CheckCircle,
  Check,
  CheckDone01,
  CheckSquare,
  CheckVerified01,
  AlertCircle,
  AlertTriangle,
  AlertHexagon,
  AlertOctagon,
  InfoCircle,
  HelpCircle,
  XCircle,
  XSquare,
  XClose,
  MinusCircle,
  // Arrows & nav (~15)
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowNarrowRight,
  ArrowNarrowLeft,
  ArrowCircleRight,
  ArrowCircleUp,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  NavigationPointer01,
  // People & objects (~15)
  User01,
  User02,
  UserCircle,
  UserCheck01,
  UserPlus01,
  Users01,
  Users02,
  Building01,
  Building02,
  Briefcase01,
  Briefcase02,
  Package,
  PackageCheck,
  Truck01,
  ShoppingBag01,
  // Misc (~15)
  Bell01,
  BellRinging01,
  Star01,
  Star06,
  Heart,
  Bookmark,
  BookmarkAdd,
  Tag01,
  Globe01,
  Globe04,
  Calendar,
  CalendarDate,
  Clock,
  ClockRefresh,
  Image01,
  Image05,
  Sun,
  Moon01,
  Cloud01,
  // Misc 2 (~15)
  Lightbulb01,
  Lightbulb04,
  MagicWand01,
  MagicWand02,
  Stars02,
  Stars03,
  Zap,
  ZapFast,
  Flag01,
  Pin01,
  MarkerPin01,
  Map01,
  Compass,
  BookOpen01,
  BookClosed,
  GraduationHat01,
  // Editor/text (~15)
  Edit01,
  Edit03,
  Pencil01,
  Pencil02,
  Brush01,
  Type01,
  Hash01,
  Code01,
  Code02,
  CodeBrowser,
  Terminal,
  PenTool01,
  Link01,
  LinkExternal01,
  Copy01,
  Clipboard,
  Save01,
  Download01,
  Upload01,
  Trash01,
  Plus,
  PlusCircle,
  RefreshCw01,
  SearchMd,
  SearchLg,
  Award01,
  Trophy01,
  Gift01,
  Wallet01,
  Coins01,
  CreditCard01,
  Receipt,
  Cube01,
  Box,
  Camera01,
  VideoRecorder,
  Headphones01,
  Play,
  PlaySquare,
  Microphone01,
  Anchor,
  Plane,
  Car01,
  Train,
  Bus,
  Route,
  Ruler,
  Calculator,
  Feather,
  Hand,
  ThumbsUp,
  ThumbsDown,
  HeartHand,
} from '@untitledui/icons';
import { cn } from '../../utils/cn';

/* ─────────────────────────────────────────────────────────────
 * IconPicker — dashed-border tile + click-to-open icon grid.
 *
 * At rest the tile shows the currently-selected glyph inside a
 * dashed-border square (default 48px). On hover the resting
 * glyph dims and a `Pencil02` overlay fades in over it. On click
 * a popover opens beneath the tile containing:
 *   - a search input (auto-focused on open)
 *   - a scrollable 7-column grid of icons (`ICON_CATALOG`)
 *   - empty state when the query matches nothing
 *
 * The popover uses a portal + ref-based positioning (no Radix
 * Popover dependency — the kb-ui package doesn't ship one and the
 * task ask explicitly forbids adding new deps).
 *
 * Motion (per emil-design-eng):
 *   - Popover enter: opacity 0 + scale 0.96 → 1, 150ms strong
 *     ease-out, transform-origin top-left (anchored to trigger).
 *   - Popover exit: opacity → 0 + scale 0.96, 100ms (exit beats
 *     enter so close feels snappy rather than draggy).
 *   - Reduce-motion: opacity-only fade — suppress the *transform*
 *     (the movement), not all motion (per Emil's rule).
 *   - Tile hover: glyph + Pencil cross-dim via opacity, 160ms.
 *   - Grid item hover: bg color crossfade 100ms — frequent enough
 *     to need instant feedback.
 *   - Press feedback: active:scale-[0.97] on grid items.
 *
 * Keyboard:
 *   - Search input is auto-focused on open.
 *   - Esc closes the popover.
 *   - Enter on a focused icon button selects it (native button
 *     behavior — no custom code needed).
 *   - Arrow-key grid navigation is intentionally skipped to keep
 *     scope tight; native Tab works to step through items.
 * ───────────────────────────────────────────────────────────── */

type IconComponent = React.ComponentType<{
  className?: string;
  size?: number;
  'aria-hidden'?: boolean | 'true' | 'false';
}>;

type CatalogEntry = { key: string; label: string; Icon: IconComponent };

/**
 * Curated cross-section of `@untitledui/icons` (~165 total).
 * Grouped by category as a maintenance hint; the picker renders
 * them in the order declared so related glyphs cluster visually.
 *
 * Every name in this list was verified against the published
 * `@untitledui/icons` index — see the build script's spot-check
 * in `IconPicker.stories.tsx`.
 */
export const ICON_CATALOG: CatalogEntry[] = [
  // Files & folders
  { key: 'folder', label: 'Folder', Icon: Folder },
  { key: 'folder-plus', label: 'Folder plus', Icon: FolderPlus },
  { key: 'folder-closed', label: 'Folder closed', Icon: FolderClosed },
  { key: 'folder-check', label: 'Folder check', Icon: FolderCheck },
  { key: 'folder-search', label: 'Folder search', Icon: FolderSearch },
  { key: 'folder-shield', label: 'Folder shield', Icon: FolderShield },
  { key: 'file', label: 'File', Icon: File02 },
  { key: 'file-doc', label: 'File document', Icon: File04 },
  { key: 'file-blank', label: 'File blank', Icon: File06 },
  { key: 'file-check', label: 'File check', Icon: FileCheck02 },
  { key: 'file-search', label: 'File search', Icon: FileSearch02 },
  { key: 'file-plus', label: 'File plus', Icon: FilePlus02 },
  { key: 'file-lock', label: 'File lock', Icon: FileLock02 },
  { key: 'file-x', label: 'File x', Icon: FileX02 },
  { key: 'file-code', label: 'File code', Icon: FileCode01 },

  // Comms
  { key: 'mail', label: 'Mail', Icon: Mail01 },
  { key: 'mail-open', label: 'Mail open', Icon: Mail02 },
  { key: 'mail-stack', label: 'Mail stack', Icon: Mail03 },
  { key: 'message', label: 'Message', Icon: MessageSquare01 },
  { key: 'message-alt', label: 'Message alt', Icon: MessageSquare02 },
  { key: 'message-chat', label: 'Message chat', Icon: MessageChatCircle },
  { key: 'message-text', label: 'Message text', Icon: MessageTextCircle01 },
  { key: 'message-dots', label: 'Message dots', Icon: MessageDotsCircle },
  { key: 'message-heart', label: 'Message heart', Icon: MessageHeartCircle },
  { key: 'phone', label: 'Phone', Icon: Phone01 },
  { key: 'phone-call', label: 'Phone call', Icon: PhoneCall01 },
  { key: 'send', label: 'Send', Icon: Send01 },
  { key: 'inbox', label: 'Inbox', Icon: Inbox01 },
  { key: 'inbox-alt', label: 'Inbox alt', Icon: Inbox02 },
  { key: 'at-sign', label: 'At sign', Icon: AtSign },
  { key: 'announcement', label: 'Announcement', Icon: Announcement01 },

  // Charts & data
  { key: 'bar-chart', label: 'Bar chart', Icon: BarChart01 },
  { key: 'bar-chart-alt', label: 'Bar chart alt', Icon: BarChart04 },
  { key: 'bar-chart-tall', label: 'Bar chart tall', Icon: BarChart07 },
  { key: 'bar-chart-square', label: 'Bar chart square', Icon: BarChartSquare02 },
  { key: 'bar-chart-square-up', label: 'Bar chart square up', Icon: BarChartSquareUp },
  { key: 'line-chart-up', label: 'Line chart up', Icon: LineChartUp01 },
  { key: 'line-chart-up-alt', label: 'Line chart up alt', Icon: LineChartUp02 },
  { key: 'line-chart-down', label: 'Line chart down', Icon: LineChartDown02 },
  { key: 'pie-chart', label: 'Pie chart', Icon: PieChart01 },
  { key: 'pie-chart-alt', label: 'Pie chart alt', Icon: PieChart03 },
  { key: 'trend-up', label: 'Trend up', Icon: TrendUp01 },
  { key: 'trend-down', label: 'Trend down', Icon: TrendDown01 },
  { key: 'activity', label: 'Activity', Icon: Activity },
  { key: 'speedometer', label: 'Speedometer', Icon: Speedometer01 },
  { key: 'database', label: 'Database', Icon: Database01 },

  // Tools & settings
  { key: 'settings', label: 'Settings', Icon: Settings01 },
  { key: 'settings-alt', label: 'Settings alt', Icon: Settings02 },
  { key: 'tool', label: 'Tool', Icon: Tool01 },
  { key: 'tool-alt', label: 'Tool alt', Icon: Tool02 },
  { key: 'sliders', label: 'Sliders', Icon: Sliders01 },
  { key: 'sliders-alt', label: 'Sliders alt', Icon: Sliders02 },
  { key: 'filter-funnel', label: 'Filter funnel', Icon: FilterFunnel01 },
  { key: 'filter-lines', label: 'Filter lines', Icon: FilterLines },
  { key: 'wifi', label: 'Wifi', Icon: Wifi },
  { key: 'key', label: 'Key', Icon: Key01 },
  { key: 'lock', label: 'Lock', Icon: Lock01 },
  { key: 'lock-unlocked', label: 'Lock unlocked', Icon: LockUnlocked01 },
  { key: 'shield', label: 'Shield', Icon: Shield01 },
  { key: 'shield-tick', label: 'Shield tick', Icon: ShieldTick },
  { key: 'eye', label: 'Eye', Icon: Eye },

  // Layout
  { key: 'grid', label: 'Grid', Icon: Grid01 },
  { key: 'grid-alt', label: 'Grid alt', Icon: Grid03 },
  { key: 'layout-grid', label: 'Layout grid', Icon: LayoutGrid01 },
  { key: 'layout-grid-alt', label: 'Layout grid alt', Icon: LayoutGrid02 },
  { key: 'layout-left', label: 'Layout left', Icon: LayoutLeft },
  { key: 'layout-right', label: 'Layout right', Icon: LayoutRight },
  { key: 'layout-top', label: 'Layout top', Icon: LayoutTop },
  { key: 'layout-bottom', label: 'Layout bottom', Icon: LayoutBottom },
  { key: 'rows', label: 'Rows', Icon: Rows01 },
  { key: 'rows-alt', label: 'Rows alt', Icon: Rows02 },
  { key: 'columns', label: 'Columns', Icon: Columns01 },
  { key: 'columns-alt', label: 'Columns alt', Icon: Columns02 },
  { key: 'list', label: 'List', Icon: List },
  { key: 'menu', label: 'Menu', Icon: Menu01 },
  { key: 'dots-grid', label: 'Dots grid', Icon: DotsGrid },

  // Status
  { key: 'check-circle', label: 'Check circle', Icon: CheckCircle },
  { key: 'check', label: 'Check', Icon: Check },
  { key: 'check-done', label: 'Check done', Icon: CheckDone01 },
  { key: 'check-square', label: 'Check square', Icon: CheckSquare },
  { key: 'check-verified', label: 'Check verified', Icon: CheckVerified01 },
  { key: 'alert-circle', label: 'Alert circle', Icon: AlertCircle },
  { key: 'alert-triangle', label: 'Alert triangle', Icon: AlertTriangle },
  { key: 'alert-hexagon', label: 'Alert hexagon', Icon: AlertHexagon },
  { key: 'alert-octagon', label: 'Alert octagon', Icon: AlertOctagon },
  { key: 'info-circle', label: 'Info circle', Icon: InfoCircle },
  { key: 'help-circle', label: 'Help circle', Icon: HelpCircle },
  { key: 'x-circle', label: 'X circle', Icon: XCircle },
  { key: 'x-square', label: 'X square', Icon: XSquare },
  { key: 'x-close', label: 'X close', Icon: XClose },
  { key: 'minus-circle', label: 'Minus circle', Icon: MinusCircle },

  // Arrows & nav
  { key: 'arrow-right', label: 'Arrow right', Icon: ArrowRight },
  { key: 'arrow-left', label: 'Arrow left', Icon: ArrowLeft },
  { key: 'arrow-up', label: 'Arrow up', Icon: ArrowUp },
  { key: 'arrow-down', label: 'Arrow down', Icon: ArrowDown },
  { key: 'arrow-up-right', label: 'Arrow up right', Icon: ArrowUpRight },
  { key: 'arrow-down-right', label: 'Arrow down right', Icon: ArrowDownRight },
  { key: 'arrow-narrow-right', label: 'Arrow narrow right', Icon: ArrowNarrowRight },
  { key: 'arrow-narrow-left', label: 'Arrow narrow left', Icon: ArrowNarrowLeft },
  { key: 'arrow-circle-right', label: 'Arrow circle right', Icon: ArrowCircleRight },
  { key: 'arrow-circle-up', label: 'Arrow circle up', Icon: ArrowCircleUp },
  { key: 'chevron-right', label: 'Chevron right', Icon: ChevronRight },
  { key: 'chevron-down', label: 'Chevron down', Icon: ChevronDown },
  { key: 'chevron-up', label: 'Chevron up', Icon: ChevronUp },
  { key: 'chevron-left', label: 'Chevron left', Icon: ChevronLeft },
  { key: 'navigation', label: 'Navigation', Icon: NavigationPointer01 },

  // People & objects
  { key: 'user', label: 'User', Icon: User01 },
  { key: 'user-alt', label: 'User alt', Icon: User02 },
  { key: 'user-circle', label: 'User circle', Icon: UserCircle },
  { key: 'user-check', label: 'User check', Icon: UserCheck01 },
  { key: 'user-plus', label: 'User plus', Icon: UserPlus01 },
  { key: 'users', label: 'Users', Icon: Users01 },
  { key: 'users-alt', label: 'Users alt', Icon: Users02 },
  { key: 'building', label: 'Building', Icon: Building01 },
  { key: 'building-alt', label: 'Building alt', Icon: Building02 },
  { key: 'briefcase', label: 'Briefcase', Icon: Briefcase01 },
  { key: 'briefcase-alt', label: 'Briefcase alt', Icon: Briefcase02 },
  { key: 'package', label: 'Package', Icon: Package },
  { key: 'package-check', label: 'Package check', Icon: PackageCheck },
  { key: 'truck', label: 'Truck', Icon: Truck01 },
  { key: 'shopping-bag', label: 'Shopping bag', Icon: ShoppingBag01 },

  // Time, places, weather, life
  { key: 'bell', label: 'Bell', Icon: Bell01 },
  { key: 'bell-ringing', label: 'Bell ringing', Icon: BellRinging01 },
  { key: 'star', label: 'Star', Icon: Star01 },
  { key: 'star-alt', label: 'Star alt', Icon: Star06 },
  { key: 'heart', label: 'Heart', Icon: Heart },
  { key: 'bookmark', label: 'Bookmark', Icon: Bookmark },
  { key: 'bookmark-add', label: 'Bookmark add', Icon: BookmarkAdd },
  { key: 'tag', label: 'Tag', Icon: Tag01 },
  { key: 'globe', label: 'Globe', Icon: Globe01 },
  { key: 'globe-alt', label: 'Globe alt', Icon: Globe04 },
  { key: 'calendar', label: 'Calendar', Icon: Calendar },
  { key: 'calendar-date', label: 'Calendar date', Icon: CalendarDate },
  { key: 'clock', label: 'Clock', Icon: Clock },
  { key: 'clock-refresh', label: 'Clock refresh', Icon: ClockRefresh },
  { key: 'image', label: 'Image', Icon: Image01 },
  { key: 'image-alt', label: 'Image alt', Icon: Image05 },
  { key: 'sun', label: 'Sun', Icon: Sun },
  { key: 'moon', label: 'Moon', Icon: Moon01 },
  { key: 'cloud', label: 'Cloud', Icon: Cloud01 },

  // Ideas, magic, energy, navigation
  { key: 'lightbulb', label: 'Lightbulb', Icon: Lightbulb01 },
  { key: 'lightbulb-alt', label: 'Lightbulb alt', Icon: Lightbulb04 },
  { key: 'magic-wand', label: 'Magic wand', Icon: MagicWand01 },
  { key: 'magic-wand-alt', label: 'Magic wand alt', Icon: MagicWand02 },
  { key: 'stars', label: 'Stars', Icon: Stars02 },
  { key: 'stars-alt', label: 'Stars alt', Icon: Stars03 },
  { key: 'zap', label: 'Zap', Icon: Zap },
  { key: 'zap-fast', label: 'Zap fast', Icon: ZapFast },
  { key: 'flag', label: 'Flag', Icon: Flag01 },
  { key: 'pin', label: 'Pin', Icon: Pin01 },
  { key: 'marker-pin', label: 'Marker pin', Icon: MarkerPin01 },
  { key: 'map', label: 'Map', Icon: Map01 },
  { key: 'compass', label: 'Compass', Icon: Compass },
  { key: 'book-open', label: 'Book open', Icon: BookOpen01 },
  { key: 'book-closed', label: 'Book closed', Icon: BookClosed },
  { key: 'graduation-hat', label: 'Graduation hat', Icon: GraduationHat01 },

  // Editor/text/code
  { key: 'edit', label: 'Edit', Icon: Edit01 },
  { key: 'edit-alt', label: 'Edit alt', Icon: Edit03 },
  { key: 'pencil', label: 'Pencil', Icon: Pencil01 },
  { key: 'pencil-alt', label: 'Pencil alt', Icon: Pencil02 },
  { key: 'brush', label: 'Brush', Icon: Brush01 },
  { key: 'type', label: 'Type', Icon: Type01 },
  { key: 'hash', label: 'Hash', Icon: Hash01 },
  { key: 'code', label: 'Code', Icon: Code01 },
  { key: 'code-alt', label: 'Code alt', Icon: Code02 },
  { key: 'code-browser', label: 'Code browser', Icon: CodeBrowser },
  { key: 'terminal', label: 'Terminal', Icon: Terminal },
  { key: 'pen-tool', label: 'Pen tool', Icon: PenTool01 },
  { key: 'link', label: 'Link', Icon: Link01 },
  { key: 'link-external', label: 'Link external', Icon: LinkExternal01 },
  { key: 'copy', label: 'Copy', Icon: Copy01 },
  { key: 'clipboard', label: 'Clipboard', Icon: Clipboard },
  { key: 'save', label: 'Save', Icon: Save01 },
  { key: 'download', label: 'Download', Icon: Download01 },
  { key: 'upload', label: 'Upload', Icon: Upload01 },
  { key: 'trash', label: 'Trash', Icon: Trash01 },
  { key: 'plus', label: 'Plus', Icon: Plus },
  { key: 'plus-circle', label: 'Plus circle', Icon: PlusCircle },
  { key: 'refresh', label: 'Refresh', Icon: RefreshCw01 },
  { key: 'search', label: 'Search', Icon: SearchMd },
  { key: 'search-lg', label: 'Search large', Icon: SearchLg },

  // Rewards, money, commerce
  { key: 'award', label: 'Award', Icon: Award01 },
  { key: 'trophy', label: 'Trophy', Icon: Trophy01 },
  { key: 'gift', label: 'Gift', Icon: Gift01 },
  { key: 'wallet', label: 'Wallet', Icon: Wallet01 },
  { key: 'coins', label: 'Coins', Icon: Coins01 },
  { key: 'credit-card', label: 'Credit card', Icon: CreditCard01 },
  { key: 'receipt', label: 'Receipt', Icon: Receipt },
  { key: 'cube', label: 'Cube', Icon: Cube01 },
  { key: 'box', label: 'Box', Icon: Box },
  { key: 'camera', label: 'Camera', Icon: Camera01 },
  { key: 'video-recorder', label: 'Video recorder', Icon: VideoRecorder },
  { key: 'headphones', label: 'Headphones', Icon: Headphones01 },
  { key: 'play', label: 'Play', Icon: Play },
  { key: 'play-square', label: 'Play square', Icon: PlaySquare },
  { key: 'microphone', label: 'Microphone', Icon: Microphone01 },

  // Travel, measurement, gestures
  { key: 'anchor', label: 'Anchor', Icon: Anchor },
  { key: 'plane', label: 'Plane', Icon: Plane },
  { key: 'car', label: 'Car', Icon: Car01 },
  { key: 'train', label: 'Train', Icon: Train },
  { key: 'bus', label: 'Bus', Icon: Bus },
  { key: 'route', label: 'Route', Icon: Route },
  { key: 'ruler', label: 'Ruler', Icon: Ruler },
  { key: 'calculator', label: 'Calculator', Icon: Calculator },
  { key: 'feather', label: 'Feather', Icon: Feather },
  { key: 'hand', label: 'Hand', Icon: Hand },
  { key: 'thumbs-up', label: 'Thumbs up', Icon: ThumbsUp },
  { key: 'thumbs-down', label: 'Thumbs down', Icon: ThumbsDown },
  { key: 'heart-hand', label: 'Heart hand', Icon: HeartHand },
];

export type IconPickerProps = {
  /** Currently selected icon key (matches a `key` in `ICON_CATALOG`). */
  value?: string;
  /** Called with the new icon key when the user picks one. */
  onChange?: (iconKey: string) => void;
  /** Optional tile size in px. Defaults to 48 (NewCategoryModal tile). */
  tileSize?: number;
  /** Optional aria-label for the tile button. Defaults to "Choose icon". */
  ariaLabel?: string;
  className?: string;
};

const POPOVER_WIDTH = 336; // 7 columns × ~40px + padding/gaps + scrollbar gutter

/** Quick lookup so the tile doesn't scan the catalog on every render. */
const catalogByKey: Map<string, CatalogEntry> = new Map(
  ICON_CATALOG.map((entry) => [entry.key, entry]),
);

/**
 * Resolves the icon component to render in the tile at rest.
 * Falls back to `Image01` when the value doesn't match a catalog
 * entry (or is undefined) so the tile is never empty.
 */
function resolveTileIcon(value: string | undefined): IconComponent {
  if (!value) return Image01;
  const entry = catalogByKey.get(value);
  return entry?.Icon ?? Image01;
}

export function IconPicker({
  value,
  onChange,
  tileSize = 48,
  ariaLabel = 'Choose icon',
  className,
}: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  /** When `open` flips false we keep the content mounted for one
   *  animation cycle to play the exit transition. `mounted` tracks
   *  whether the popover is in the DOM; `open` drives data-state. */
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const TileIcon = React.useMemo(() => resolveTileIcon(value), [value]);

  /* Compute popover position relative to the trigger.
   * Anchored top-left of the trigger + sideOffset 8 to mirror the
   * align="start", sideOffset=8 contract in the brief. */
  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8 + window.scrollY,
      left: rect.left + window.scrollX,
    });
  }, []);

  /* Open/close orchestration.
   * - On open: mount immediately, measure position, set open=true
   *   on the next frame so the enter animation runs.
   * - On close: flip open=false (triggers exit animation), then
   *   unmount after the animation completes (140ms — matches the
   *   popover-out keyframe). */
  const handleOpen = React.useCallback(() => {
    setMounted(true);
    updatePosition();
    setOpen(true);
    setQuery('');
  }, [updatePosition]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  /* Esc key + outside-click close. Both effects only run while
   * the popover is mounted, so they don't add listeners in the
   * common closed state. */
  React.useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mounted, handleClose]);

  React.useEffect(() => {
    if (!mounted) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const popover = popoverRef.current;
      const trigger = triggerRef.current;
      if (popover?.contains(target)) return;
      if (trigger?.contains(target)) return;
      handleClose();
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [mounted, handleClose]);

  /* Reposition on scroll/resize while open. We deliberately don't
   * subscribe in the closed state to avoid the cost. */
  React.useEffect(() => {
    if (!open) return;
    const onReflow = () => updatePosition();
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);
    return () => {
      window.removeEventListener('scroll', onReflow, true);
      window.removeEventListener('resize', onReflow);
    };
  }, [open, updatePosition]);

  /* Auto-focus the search input on mount. requestAnimationFrame
   * defers past the click that opened us so the trigger doesn't
   * steal focus back. */
  React.useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  /* Unmount-on-exit. When `open` flips false, we wait 140ms
   * (matches the exit keyframe duration in tokens.css) then unmount.
   * Using a timeout instead of animationend so the path is the same
   * for both motion-safe and motion-reduce users. */
  React.useEffect(() => {
    if (open) return;
    if (!mounted) return;
    const t = window.setTimeout(() => setMounted(false), 140);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_CATALOG;
    return ICON_CATALOG.filter((entry) => entry.label.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = (key: string) => {
    onChange?.(key);
    handleClose();
  };

  return (
    <div className={cn('inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? handleClose() : handleOpen())}
        style={{ width: tileSize, height: tileSize }}
        className={cn(
          'group relative flex items-center justify-center rounded-[7px]',
          'border-[1.5px] border-dashed border-[#cbd5e1]',
          'hover:border-[#94a3b8] hover:bg-sky-50/50',
          // Background tween is frequent enough that we keep it short.
          'motion-safe:transition-[background-color,border-color] motion-safe:duration-150 motion-safe:ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
        )}
      >
        {/* Resting glyph — dims on hover so the Pencil overlay can fade
         *  in over it. Keeps a small residual opacity (0.4) on hover so
         *  the user still sees what's selected behind the edit affordance. */}
        <TileIcon
          aria-hidden="true"
          className={cn(
            'h-[22px] w-[22px] text-[#6634ef]',
            'motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-out',
            'group-hover:opacity-40',
          )}
        />
        {/* Hover overlay — Pencil02 at 16px. Absolute-positioned so it
         *  doesn't shift the tile's layout when it appears. */}
        <Pencil02
          aria-hidden="true"
          className={cn(
            'absolute h-4 w-4 text-text-secondary',
            'opacity-0 group-hover:opacity-100',
            'motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-out',
          )}
        />
      </button>

      {mounted &&
        position &&
        createPortal(
          <div
            ref={popoverRef}
            data-state={open ? 'open' : 'closed'}
            role="dialog"
            aria-label="Icon picker"
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              width: POPOVER_WIDTH,
              transformOrigin: 'top left',
              // Must outrank Modal's z-[91] content layer so the popover
              // renders above its hosting modal when used inside one
              // (the NewCategoryModal Field is the canonical case).
              zIndex: 200,
              // `pointer-events: auto` is required because Radix Dialog's
              // scroll-lock disables pointer events on every `body > *`
              // sibling while open. The popover is portaled to `body`
              // outside the Dialog's own portal subtree, so it inherits
              // the lock and silently becomes click-through. This line is
              // the workaround — without it, clicking an icon inside the
              // grid falls through to the modal backdrop behind.
              pointerEvents: 'auto',
            }}
            className={cn(
              'rounded-lg border border-[#e5e5e5] bg-white p-2 shadow-md',
              // Motion vocabulary: matches the kb-dropdown-in/out keyframes
              // in tokens.css. Reduce-motion path is opacity-only fade so we
              // suppress the transform (the movement), not all motion.
              'motion-safe:data-[state=open]:animate-kb-dropdown-in',
              'motion-safe:data-[state=closed]:animate-kb-dropdown-out',
              'motion-reduce:data-[state=open]:animate-kb-fade-in',
              'motion-reduce:data-[state=closed]:animate-kb-fade-out',
            )}
          >
            {/* Search */}
            <div className="flex items-center gap-1.5 rounded-md border border-[#e5e5e5] bg-white px-2.5 py-1.5">
              <SearchMd aria-hidden="true" className="h-4 w-4 shrink-0 text-text-meta" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons"
                aria-label="Search icons"
                className={cn(
                  'min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-5',
                  'text-text-primary outline-none placeholder:text-text-disabled',
                )}
              />
            </div>

            {/* Grid / empty state */}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-text-meta">
                No icons match &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div
                className={cn(
                  'mt-2 grid grid-cols-7 gap-1',
                  'max-h-[280px] overflow-y-auto',
                )}
              >
                {filtered.map(({ key, label, Icon }) => {
                  const isSelected = key === value;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={label}
                      aria-label={label}
                      aria-pressed={isSelected}
                      onClick={() => handleSelect(key)}
                      className={cn(
                        'flex aspect-square w-full items-center justify-center rounded-md',
                        // Frequent hover; 100ms color crossfade is instant
                        // without flashing. active:scale-[0.97] is the
                        // canonical press feedback from Button/Switch.
                        'motion-safe:transition-[background-color,color] motion-safe:duration-100 motion-safe:ease-out',
                        'motion-safe:active:scale-[0.97]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                        isSelected
                          ? 'bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-500'
                          : 'text-text-secondary hover:bg-sky-50 hover:text-text-primary',
                      )}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
