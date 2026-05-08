/**
 * FigmaCompare — internal Storybook design-review canvas.
 *
 * Two layout modes:
 *
 * 1. Split (default) — two side-by-side panes. Left pane shows the rendered
 *    React tree, right pane shows the Figma raster. Each pane independently
 *    fits its own content to its viewport (panes have *different* base scales
 *    and base pans because their content sizes differ). The user-controlled
 *    zoom/pan is a *delta* applied on top of each pane's base — so when the
 *    user zooms or drags one pane, the other tracks it relative to its own
 *    fit. That's the "synced" behavior.
 *
 * 2. Overlay — stacked-at-origin view (the original behavior) with opacity
 *    blending, layer visibility (Render/Figma/Both), and swipe clipping for
 *    pixel-precise overlap inspection. Single shared coordinate system.
 *
 * Annotation pins remember which pane they were dropped on (split mode) and
 * store coordinates in that pane's content space. They re-render through
 * the owning pane's effective (scale, pan).
 *
 * NOT exported from the public barrel. NOT shipped in the npm package.
 * Lives strictly in `src/_review/` and is consumed only by review stories.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

/* ------------------------------------------------------------------ */
/* Public types                                                       */
/* ------------------------------------------------------------------ */

export type FigmaCompareProps = {
  /** Required — used for pin localStorage key. */
  storyKey: string;
  /** Image src — typically `import x from 'design/screenshots/y.png'`. */
  figmaImage: string;
  /** Optional URL pointing at the Figma node. */
  figmaNodeUrl?: string;
  /** Label shown in toolbar, e.g. "Button". */
  componentLabel?: string;
  /** Label shown in toolbar, e.g. "Figma · Button / Primary". */
  frameLabel?: string;
  /** Background color of the rendered layer. Defaults to 'white'. */
  componentBackground?: 'white' | 'canvas' | 'transparent';
  /** Initial zoom multiplier (1 = base fit). Defaults to 1. */
  initialZoom?: 'fit' | number;
  /** The rendered component being reviewed. */
  children: ReactNode;
};

type LayerMode = 'render' | 'figma' | 'both';
type ViewMode = 'split' | 'overlay';
type PaneSide = 'render' | 'figma';
type PinStatus = 'open' | 'fixed' | 'wontfix';

type Pin = {
  id: string;
  x: number;
  y: number;
  number: number;
  note: string;
  status: PinStatus;
  createdAt: string;
  /** Which pane the pin was dropped on. Defaults to 'render'. Coordinates
   * are in the OWNING pane's content space (pre-transform). */
  pane?: PaneSide;
};

type Vec2 = { x: number; y: number };

/** A pane's intrinsic fit: scale + pan that shows its content centered. */
type PaneFit = {
  baseScale: number;
  basePan: Vec2;
};

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const ZOOM_SENSITIVITY = 0.0015;
const MIN_MULTIPLIER = 0.1;
const MAX_MULTIPLIER = 16;
const ZOOM_STEP = 1.2;
const ZOOM_PRESETS: Array<{ label: string; value: number | 'fit' }> = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '100%', value: 1 },
  { label: '200%', value: 2 },
  { label: '400%', value: 4 },
  { label: 'Fit', value: 'fit' },
];

const COMPONENT_BG: Record<
  NonNullable<FigmaCompareProps['componentBackground']>,
  string
> = {
  white: '#ffffff',
  canvas: '#f5f5f5',
  transparent: 'transparent',
};

const PIN_STATUS_COLOR: Record<PinStatus, string> = {
  open: '#dc2626', // red-600
  fixed: '#16a34a', // green-600
  wontfix: '#71717a', // zinc-500
};

const PIN_SIZE = 24;
const ZERO_VEC: Vec2 = { x: 0, y: 0 };

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

function useImageNaturalSize(src: string) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return size;
}

function useElementSize<T extends HTMLElement>() {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const observerRef = useRef<ResizeObserver | null>(null);
  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const r = entry.contentRect;
      setSize({ width: Math.round(r.width), height: Math.round(r.height) });
    });
    ro.observe(node);
    observerRef.current = ro;
  }, []);
  return [ref, size] as const;
}

function useStoredPins(storyKey: string) {
  const lsKey = `figma-compare:pins:${storyKey}`;
  const [pins, setPins] = useState<Pin[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(lsKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Pin[];
      return [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(lsKey, JSON.stringify(pins));
    } catch {
      // ignore quota / serialization errors
    }
  }, [lsKey, pins]);
  return [pins, setPins] as const;
}

function useStoredFlag(key: string, initial: boolean) {
  const [val, setVal] = useState<boolean>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      return raw === '1';
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, val ? '1' : '0');
    } catch {
      // ignore
    }
  }, [key, val]);
  return [val, setVal] as const;
}

/* ------------------------------------------------------------------ */
/* Fit math                                                           */
/* ------------------------------------------------------------------ */

/**
 * Given a viewport (canvas) size and a content size, compute the base scale
 * and pan that fit the content centered with comfortable margins.
 */
function computePaneFit(
  viewport: { width: number; height: number },
  content: { width: number; height: number },
): PaneFit | null {
  if (viewport.width <= 0 || viewport.height <= 0) return null;
  if (content.width <= 0 || content.height <= 0) return null;
  const fitScale =
    Math.min(
      viewport.width / content.width,
      viewport.height / content.height,
    ) * 0.9;
  const baseScale = Math.max(0.001, fitScale);
  const basePan: Vec2 = {
    x: (viewport.width - content.width * baseScale) / 2,
    y: (viewport.height - content.height * baseScale) / 2,
  };
  return { baseScale, basePan };
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function FigmaCompare({
  storyKey,
  figmaImage,
  figmaNodeUrl,
  componentLabel,
  frameLabel,
  componentBackground = 'white',
  initialZoom = 'fit',
  children,
}: FigmaCompareProps) {
  // --- canvas + sizing refs/state ------------------------------------
  const outerRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLDivElement | null>(null);
  const renderPaneRef = useRef<HTMLDivElement | null>(null);
  const figmaPaneRef = useRef<HTMLDivElement | null>(null);

  // The viewport size of each pane. In split mode left+right are typically
  // equal but we measure both in case the grid stretches differently.
  const [renderPaneSizeRef, renderPaneSize] = useElementSize<HTMLDivElement>();
  const [figmaPaneSizeRef, figmaPaneSize] = useElementSize<HTMLDivElement>();
  const [overlayCanvasSizeRef, overlayCanvasSize] =
    useElementSize<HTMLDivElement>();

  // The natural sizes of each layer.
  const [renderedSizeRef, renderedSize] = useElementSize<HTMLDivElement>();
  const figmaSize = useImageNaturalSize(figmaImage);

  // Overlay-mode bounding box (max of both layers — they share an origin).
  const overlayContentBox = useMemo(() => {
    const rw = renderedSize.width || 0;
    const rh = renderedSize.height || 0;
    const fw = figmaSize?.width ?? 0;
    const fh = figmaSize?.height ?? 0;
    return { width: Math.max(rw, fw), height: Math.max(rh, fh) };
  }, [renderedSize.width, renderedSize.height, figmaSize]);

  // --- view state ----------------------------------------------------
  // `zoomMultiplier` is the *delta* on top of each pane's base scale; 1 = fit.
  // `panDelta` is the *delta* on top of each pane's base pan; (0,0) = centered.
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);
  const [panDelta, setPanDelta] = useState<Vec2>(ZERO_VEC);
  const [viewMode, setViewMode] = useState<boolean>(false);
  const mode: ViewMode = viewMode ? 'overlay' : 'split';
  const [layerMode, setLayerMode] = useState<LayerMode>('both');
  const [figmaOpacity, setFigmaOpacity] = useState<number>(50);
  const [swipeOn, setSwipeOn] = useState(false);
  const [swipePercent, setSwipePercent] = useState<number>(50);
  const [annotateOn, setAnnotateOn] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useStoredFlag(
    `figma-compare:drawer:${storyKey}`,
    true,
  );
  const [transitionTransform, setTransitionTransform] = useState(false);

  // initial-fit gate per mode (we recompute base-fit live, but on first mount
  // we also want to honor `initialZoom` if the user passed a non-'fit' value).
  const initialZoomAppliedRef = useRef(false);

  // --- pins ----------------------------------------------------------
  const [pins, setPins] = useStoredPins(storyKey);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const draggingPinRef = useRef<{
    id: string;
    pointerId: number;
    suppressClick: boolean;
  } | null>(null);

  /* ------------------------------------------------------------------ */
  /* Per-pane base fit                                                  */
  /* ------------------------------------------------------------------ */

  // Render pane fits the rendered React tree into the left pane viewport.
  const renderFit = useMemo<PaneFit | null>(
    () => computePaneFit(renderPaneSize, renderedSize),
    [renderPaneSize, renderedSize],
  );

  // Figma pane fits the Figma image into the right pane viewport.
  const figmaFit = useMemo<PaneFit | null>(
    () =>
      figmaSize
        ? computePaneFit(figmaPaneSize, figmaSize)
        : null,
    [figmaPaneSize, figmaSize],
  );

  // Overlay-mode fit: shared bbox into the single overlay canvas.
  const overlayFit = useMemo<PaneFit | null>(
    () => computePaneFit(overlayCanvasSize, overlayContentBox),
    [overlayCanvasSize, overlayContentBox],
  );

  /** Resolve the effective fit for a given pane / mode. */
  const fitFor = useCallback(
    (pane: PaneSide): PaneFit | null => {
      if (mode === 'overlay') return overlayFit;
      return pane === 'render' ? renderFit : figmaFit;
    },
    [mode, overlayFit, renderFit, figmaFit],
  );

  /* ------------------------------------------------------------------ */
  /* Apply initialZoom on first mount                                   */
  /* ------------------------------------------------------------------ */

  useLayoutEffect(() => {
    if (initialZoomAppliedRef.current) return;
    // Wait until at least one fit is resolvable so we know the panes have
    // measured and can sensibly seed the multiplier.
    const anyFit =
      mode === 'overlay' ? overlayFit : renderFit && figmaFit;
    if (!anyFit) return;
    initialZoomAppliedRef.current = true;
    if (initialZoom === 'fit') {
      setZoomMultiplier(1);
      setPanDelta(ZERO_VEC);
    } else {
      setZoomMultiplier(
        Math.max(MIN_MULTIPLIER, Math.min(MAX_MULTIPLIER, initialZoom)),
      );
      setPanDelta(ZERO_VEC);
    }
  }, [initialZoom, mode, overlayFit, renderFit, figmaFit]);

  /* ------------------------------------------------------------------ */
  /* Derived effective transforms                                       */
  /* ------------------------------------------------------------------ */

  /**
   * For a given pane, return the effective scale and effective pan after
   * applying the user's zoomMultiplier / panDelta.
   * Cursor-anchored zoom math is performed in *pane-local screen* coords:
   * effective transform is `translate(effectivePan) scale(effectiveScale)`
   * applied to the pane's content origin (0,0).
   */
  const effectiveTransform = useCallback(
    (pane: PaneSide) => {
      const fit = fitFor(pane);
      if (!fit) {
        return {
          scale: zoomMultiplier,
          pan: panDelta,
        };
      }
      return {
        scale: fit.baseScale * zoomMultiplier,
        pan: {
          x: fit.basePan.x + panDelta.x,
          y: fit.basePan.y + panDelta.y,
        },
      };
    },
    [fitFor, zoomMultiplier, panDelta],
  );

  /* ------------------------------------------------------------------ */
  /* Reset / preset zoom                                                */
  /* ------------------------------------------------------------------ */

  const fitToCanvas = useCallback(
    (smooth = false) => {
      if (smooth) {
        setTransitionTransform(true);
        window.setTimeout(() => setTransitionTransform(false), 220);
      }
      setZoomMultiplier(1);
      setPanDelta(ZERO_VEC);
    },
    [],
  );

  /**
   * Set the zoom multiplier centered on the midpoint of whichever pane the
   * user is interacting with. We choose the render pane in split mode for
   * keyboard shortcuts and the toolbar (no cursor → use the left pane's
   * center as a stable reference).
   */
  const setZoomCentered = useCallback(
    (target: number, smooth = false) => {
      const z = Math.max(MIN_MULTIPLIER, Math.min(MAX_MULTIPLIER, target));
      // Use the render pane (split) or overlay canvas as the anchor pane.
      const anchorPane: PaneSide = 'render';
      const fit = fitFor(anchorPane);
      if (!fit) {
        setZoomMultiplier(z);
        return;
      }
      const viewport =
        mode === 'overlay'
          ? overlayCanvasSize
          : anchorPane === 'render'
            ? renderPaneSize
            : figmaPaneSize;
      if (viewport.width <= 0 || viewport.height <= 0) {
        setZoomMultiplier(z);
        return;
      }
      const cx = viewport.width / 2;
      const cy = viewport.height / 2;
      // Effective scale before/after on the anchor pane.
      const oldScale = fit.baseScale * zoomMultiplier;
      const newScale = fit.baseScale * z;
      const ratio = newScale / oldScale;
      // Effective pan before/after (we want point under (cx,cy) to stay put).
      const oldPanX = fit.basePan.x + panDelta.x;
      const oldPanY = fit.basePan.y + panDelta.y;
      const newPanX = cx - (cx - oldPanX) * ratio;
      const newPanY = cy - (cy - oldPanY) * ratio;
      // Convert back to a delta.
      const newDelta: Vec2 = {
        x: newPanX - fit.basePan.x,
        y: newPanY - fit.basePan.y,
      };
      if (smooth) {
        setTransitionTransform(true);
        window.setTimeout(() => setTransitionTransform(false), 180);
      }
      setPanDelta(newDelta);
      setZoomMultiplier(z);
    },
    [
      fitFor,
      mode,
      overlayCanvasSize,
      renderPaneSize,
      figmaPaneSize,
      zoomMultiplier,
      panDelta,
    ],
  );

  /* ------------------------------------------------------------------ */
  /* Wheel handling — non-passive for preventDefault                    */
  /* ------------------------------------------------------------------ */

  const zoomMultiplierRef = useRef(zoomMultiplier);
  const panDeltaRef = useRef(panDelta);
  useEffect(() => {
    zoomMultiplierRef.current = zoomMultiplier;
  }, [zoomMultiplier]);
  useEffect(() => {
    panDeltaRef.current = panDelta;
  }, [panDelta]);

  // Bind a wheel handler to a specific pane. Cursor-anchored zoom math runs
  // in that pane's local screen coords using its own base fit; the resulting
  // delta updates apply to *both* panes (synced behavior).
  const makeWheelHandler = useCallback(
    (pane: PaneSide, getNode: () => HTMLDivElement | null) =>
      (e: WheelEvent) => {
        const node = getNode();
        if (!node) return;
        // Two-finger pan on trackpads (no ctrl/meta).
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setPanDelta((d) => ({ x: d.x - e.deltaX, y: d.y - e.deltaY }));
          return;
        }
        e.preventDefault();
        const fit = fitFor(pane);
        if (!fit) return;

        const currentMultiplier = zoomMultiplierRef.current;
        const currentDelta = panDeltaRef.current;
        const stepDelta = -e.deltaY * ZOOM_SENSITIVITY;
        const factor = Math.exp(stepDelta);
        const nextMultiplier = Math.max(
          MIN_MULTIPLIER,
          Math.min(MAX_MULTIPLIER, currentMultiplier * factor),
        );

        const oldScale = fit.baseScale * currentMultiplier;
        const newScale = fit.baseScale * nextMultiplier;
        const ratio = newScale / oldScale;

        const rect = node.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const oldPanX = fit.basePan.x + currentDelta.x;
        const oldPanY = fit.basePan.y + currentDelta.y;
        const newPanX = mx - (mx - oldPanX) * ratio;
        const newPanY = my - (my - oldPanY) * ratio;

        setPanDelta({
          x: newPanX - fit.basePan.x,
          y: newPanY - fit.basePan.y,
        });
        setZoomMultiplier(nextMultiplier);
      },
    [fitFor],
  );

  useEffect(() => {
    if (mode === 'overlay') {
      const node = overlayCanvasRef.current;
      if (!node) return;
      const onWheel = makeWheelHandler('render', () => overlayCanvasRef.current);
      node.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        node.removeEventListener('wheel', onWheel);
      };
    }
    const renderNode = renderPaneRef.current;
    const figmaNode = figmaPaneRef.current;
    const onRenderWheel = makeWheelHandler('render', () => renderPaneRef.current);
    const onFigmaWheel = makeWheelHandler('figma', () => figmaPaneRef.current);
    renderNode?.addEventListener('wheel', onRenderWheel, { passive: false });
    figmaNode?.addEventListener('wheel', onFigmaWheel, { passive: false });
    return () => {
      renderNode?.removeEventListener('wheel', onRenderWheel);
      figmaNode?.removeEventListener('wheel', onFigmaWheel);
    };
  }, [mode, makeWheelHandler]);

  /* ------------------------------------------------------------------ */
  /* Pan via pointer (space-drag or middle-mouse)                       */
  /* ------------------------------------------------------------------ */

  const panStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startDelta: Vec2;
    button: number;
  } | null>(null);
  const [panActive, setPanActive] = useState(false);

  const onCanvasPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-pin-handle="true"]')) return;
    if (target.closest('[data-pin-popover="true"]')) return;
    const isMiddle = e.button === 1;
    const isLeftWithSpace = e.button === 0 && spaceHeld;
    if (!isMiddle && !isLeftWithSpace) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    panStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startDelta: { ...panDelta },
      button: e.button,
    };
    setPanActive(true);
  };

  const onCanvasPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = panStateRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    setPanDelta({ x: st.startDelta.x + dx, y: st.startDelta.y + dy });
  };

  const onCanvasPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = panStateRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    panStateRef.current = null;
    setPanActive(false);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  /* ------------------------------------------------------------------ */
  /* Pin drop on click                                                  */
  /* ------------------------------------------------------------------ */

  const handleCanvasClick = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      paneNode: HTMLDivElement | null,
      pane: PaneSide,
    ) => {
      if (!annotateOn || spaceHeld) return;
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-pin-handle="true"]')) return;
      if (target.closest('[data-pin-popover="true"]')) return;
      if (panStateRef.current) return;

      const rect = paneNode?.getBoundingClientRect();
      if (!rect) return;
      const fit = fitFor(pane);
      if (!fit) return;

      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const effScale = fit.baseScale * zoomMultiplier;
      const effPanX = fit.basePan.x + panDelta.x;
      const effPanY = fit.basePan.y + panDelta.y;
      const cx = (sx - effPanX) / effScale;
      const cy = (sy - effPanY) / effScale;

      const nextNumber =
        pins.reduce((max, p) => (p.number > max ? p.number : max), 0) + 1;
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `pin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newPin: Pin = {
        id,
        x: cx,
        y: cy,
        number: nextNumber,
        note: '',
        status: 'open',
        createdAt: new Date().toISOString(),
        pane,
      };
      setPins((prev) => [...prev, newPin]);
      setSelectedPinId(id);
    },
    [annotateOn, spaceHeld, fitFor, zoomMultiplier, panDelta, pins, setPins],
  );

  /* ------------------------------------------------------------------ */
  /* Keyboard shortcuts                                                 */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const isTextInput = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      );
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (isTextInput(e.target)) return;
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if (isTextInput(e.target)) return;
      switch (e.key) {
        case '0':
          e.preventDefault();
          fitToCanvas(true);
          break;
        case '1':
          e.preventDefault();
          setZoomCentered(1, true);
          break;
        case '2':
          e.preventDefault();
          setZoomCentered(2, true);
          break;
        case '4':
          e.preventDefault();
          setZoomCentered(4, true);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoomCentered(zoomMultiplierRef.current * ZOOM_STEP, true);
          break;
        case '-':
        case '_':
          e.preventDefault();
          setZoomCentered(zoomMultiplierRef.current / ZOOM_STEP, true);
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setAnnotateOn((v) => !v);
          break;
        case 'Escape':
          if (annotateOn) {
            e.preventDefault();
            setAnnotateOn(false);
          }
          if (selectedPinId) {
            setSelectedPinId(null);
          }
          break;
        default:
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceHeld(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [fitToCanvas, setZoomCentered, annotateOn, selectedPinId]);

  /* ------------------------------------------------------------------ */
  /* Pin manipulation                                                   */
  /* ------------------------------------------------------------------ */

  const updatePin = useCallback(
    (id: string, patch: Partial<Pin>) => {
      setPins((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [setPins],
  );

  const removePin = useCallback(
    (id: string) => {
      setPins((prev) => prev.filter((p) => p.id !== id));
      setSelectedPinId((cur) => (cur === id ? null : cur));
    },
    [setPins],
  );

  const focusOnPin = useCallback(
    (pin: Pin) => {
      const pinPane: PaneSide = pin.pane ?? 'render';
      const fit = fitFor(pinPane);
      const viewport =
        mode === 'overlay'
          ? overlayCanvasSize
          : pinPane === 'render'
            ? renderPaneSize
            : figmaPaneSize;
      if (!fit) return;
      if (viewport.width <= 0 || viewport.height <= 0) return;
      // Make the pin visible — bump multiplier so effective scale ≥ 1.5
      // (or keep current if already higher).
      const minMultiplier = Math.max(zoomMultiplier, 1.5 / fit.baseScale);
      const effScale = fit.baseScale * minMultiplier;
      // Center pin in pane viewport.
      const newEffPanX = viewport.width / 2 - pin.x * effScale;
      const newEffPanY = viewport.height / 2 - pin.y * effScale;
      const newDelta: Vec2 = {
        x: newEffPanX - fit.basePan.x,
        y: newEffPanY - fit.basePan.y,
      };
      setTransitionTransform(true);
      window.setTimeout(() => setTransitionTransform(false), 220);
      setZoomMultiplier(minMultiplier);
      setPanDelta(newDelta);
      setSelectedPinId(pin.id);
    },
    [
      fitFor,
      mode,
      overlayCanvasSize,
      renderPaneSize,
      figmaPaneSize,
      zoomMultiplier,
    ],
  );

  /* ------------------------------------------------------------------ */
  /* Export                                                             */
  /* ------------------------------------------------------------------ */

  const exportPins = useCallback(() => {
    const blob = new Blob([JSON.stringify(pins, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyKey}-pins.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pins, storyKey]);

  /* ------------------------------------------------------------------ */
  /* Cursor selection                                                   */
  /* ------------------------------------------------------------------ */

  const cursor = useMemo(() => {
    if (panActive) return 'grabbing';
    if (spaceHeld) return 'grab';
    if (annotateOn) return 'crosshair';
    return 'default';
  }, [panActive, spaceHeld, annotateOn]);

  /* ------------------------------------------------------------------ */
  /* Layer visibility (overlay mode)                                    */
  /* ------------------------------------------------------------------ */

  const showRender = layerMode !== 'figma';
  const showFigma = layerMode !== 'render';
  const showOpacityControl = layerMode === 'both';

  const effectiveFigmaOpacity =
    layerMode === 'figma'
      ? 1
      : layerMode === 'render'
        ? 0
        : swipeOn
          ? 1
          : figmaOpacity / 100;

  // Swipe clip — overlay mode only. Uses the overlay-shared transform.
  const swipeActive =
    mode === 'overlay' && layerMode === 'both' && swipeOn;
  const overlayEff = effectiveTransform('render'); // overlay shares one transform
  const figmaClipPath = useMemo(() => {
    if (!swipeActive) return undefined;
    if (!figmaSize) return undefined;
    if (overlayCanvasSize.width <= 0 || overlayEff.scale <= 0) return undefined;
    const dividerScreenX = (overlayCanvasSize.width * swipePercent) / 100;
    const imageLocalX = (dividerScreenX - overlayEff.pan.x) / overlayEff.scale;
    const clampedX = Math.max(0, Math.min(figmaSize.width, imageLocalX));
    const rightInset = figmaSize.width - clampedX;
    return `inset(0 ${rightInset}px 0 0)`;
  }, [
    swipeActive,
    figmaSize,
    overlayCanvasSize.width,
    swipePercent,
    overlayEff.pan.x,
    overlayEff.scale,
  ]);

  /* ------------------------------------------------------------------ */
  /* Effective per-pane transforms (computed for render)                */
  /* ------------------------------------------------------------------ */

  const renderEff = effectiveTransform('render');
  const figmaEff = effectiveTransform('figma');

  const makeContentLayerStyle = (
    eff: { scale: number; pan: Vec2 },
    contentSize?: { width: number; height: number },
  ): CSSProperties => ({
    transform: `translate(${eff.pan.x}px, ${eff.pan.y}px) scale(${eff.scale})`,
    transformOrigin: '0 0',
    transition: transitionTransform ? 'transform 200ms ease-out' : undefined,
    width: contentSize && contentSize.width > 0 ? contentSize.width : undefined,
    height: contentSize && contentSize.height > 0 ? contentSize.height : undefined,
  });

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  const setOverlayCanvasRef = useCallback(
    (node: HTMLDivElement | null) => {
      overlayCanvasRef.current = node;
      if (mode === 'overlay') overlayCanvasSizeRef(node);
    },
    [overlayCanvasSizeRef, mode],
  );
  const setRenderPaneRef = useCallback(
    (node: HTMLDivElement | null) => {
      renderPaneRef.current = node;
      if (mode === 'split') renderPaneSizeRef(node);
    },
    [renderPaneSizeRef, mode],
  );
  const setFigmaPaneRef = useCallback(
    (node: HTMLDivElement | null) => {
      figmaPaneRef.current = node;
      if (mode === 'split') figmaPaneSizeRef(node);
    },
    [figmaPaneSizeRef, mode],
  );

  const renderedDomRef = useRef<HTMLDivElement | null>(null);
  const setRenderedRef = useCallback(
    (node: HTMLDivElement | null) => {
      renderedDomRef.current = node;
      renderedSizeRef(node);
    },
    [renderedSizeRef],
  );

  /**
   * Render pins for a specific pane. Each pin's effective on-screen position
   * is computed via the OWNING pane's transform — but we wrap pins inside the
   * transformed content layer, so the pin's `left/top` use raw content coords
   * and inherit the layer transform automatically (with a counter-scale on
   * the visual circle so its on-screen size stays constant).
   */
  const renderPinsFor = (
    paneFilter: PaneSide | 'all',
    effScale: number,
  ) =>
    pins
      .filter((pin) => {
        if (paneFilter === 'all') return true;
        return (pin.pane ?? 'render') === paneFilter;
      })
      .map((pin) => (
        <PinHandle
          key={pin.id}
          pin={pin}
          zoom={effScale}
          selected={selectedPinId === pin.id}
          onSelect={() => setSelectedPinId(pin.id)}
          onDragMove={(dx, dy) => {
            if (draggingPinRef.current) {
              draggingPinRef.current.suppressClick = true;
            }
            updatePin(pin.id, {
              x: pin.x + dx / effScale,
              y: pin.y + dy / effScale,
            });
          }}
          onDragStart={(pointerId) => {
            draggingPinRef.current = {
              id: pin.id,
              pointerId,
              suppressClick: false,
            };
          }}
          onDragEnd={() => {
            draggingPinRef.current = null;
          }}
        />
      ));

  // Selected-pin popover — anchored in screen space. Position uses the
  // owning pane's effective transform.
  const popoverNode = (() => {
    if (!selectedPinId) return null;
    const pin = pins.find((p) => p.id === selectedPinId);
    if (!pin) return null;
    const pinPane: PaneSide = pin.pane ?? 'render';
    const paneEl =
      mode === 'overlay'
        ? overlayCanvasRef.current
        : pinPane === 'render'
          ? renderPaneRef.current
          : figmaPaneRef.current;
    if (!paneEl) return null;
    const fit = fitFor(pinPane);
    if (!fit) return null;
    const paneRect = paneEl.getBoundingClientRect();
    const outerRect = outerRef.current?.getBoundingClientRect();
    if (!outerRect) return null;
    const effScale = fit.baseScale * zoomMultiplier;
    const effPanX = fit.basePan.x + panDelta.x;
    const effPanY = fit.basePan.y + panDelta.y;
    const sx = pin.x * effScale + effPanX + (paneRect.left - outerRect.left);
    const sy = pin.y * effScale + effPanY + (paneRect.top - outerRect.top);
    return (
      <PinPopover
        pin={pin}
        anchorX={sx}
        anchorY={sy}
        onClose={() => setSelectedPinId(null)}
        onChange={(patch) => updatePin(pin.id, patch)}
        onDelete={() => removePin(pin.id)}
      />
    );
  })();

  return (
    <div ref={outerRef} className="relative flex flex-col gap-2 font-sans">
      <Toolbar
        mode={mode}
        onModeChange={(m) => setViewMode(m === 'overlay')}
        layerMode={layerMode}
        onLayerModeChange={setLayerMode}
        showOpacityControl={showOpacityControl}
        figmaOpacity={figmaOpacity}
        onFigmaOpacityChange={setFigmaOpacity}
        swipeOn={swipeOn}
        onSwipeChange={setSwipeOn}
        swipePercent={swipePercent}
        onSwipePercentChange={setSwipePercent}
        zoomMultiplier={zoomMultiplier}
        onZoomIn={() => setZoomCentered(zoomMultiplierRef.current * ZOOM_STEP, true)}
        onZoomOut={() => setZoomCentered(zoomMultiplierRef.current / ZOOM_STEP, true)}
        onZoomTo={(v) => {
          if (v === 'fit') fitToCanvas(true);
          else setZoomCentered(v, true);
        }}
        zoomMenuOpen={zoomMenuOpen}
        onZoomMenuOpenChange={setZoomMenuOpen}
        annotateOn={annotateOn}
        onAnnotateChange={setAnnotateOn}
        onExport={exportPins}
        renderedSize={renderedSize}
        figmaSize={figmaSize}
        componentLabel={componentLabel}
        frameLabel={frameLabel}
        figmaNodeUrl={figmaNodeUrl}
      />

      {mode === 'split' ? (
        <div className="grid h-[640px] w-full grid-cols-2 gap-2">
          {/* Render pane */}
          <div
            ref={setRenderPaneRef}
            data-pane="render"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerCancel={onCanvasPointerUp}
            onClick={(e) =>
              handleCanvasClick(e, renderPaneRef.current, 'render')
            }
            onContextMenu={(e) => {
              if (annotateOn) e.preventDefault();
            }}
            className="relative h-full w-full overflow-hidden rounded-md border border-zinc-800 bg-[#0a0a0a]"
            style={{ cursor, touchAction: 'none' }}
          >
            <PaneLabel>Rendered</PaneLabel>
            <div
              className="absolute left-0 top-0"
              style={makeContentLayerStyle(renderEff, renderedSize)}
            >
              <div
                ref={setRenderedRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  display: 'inline-block',
                  width: 'max-content',
                  background: COMPONENT_BG[componentBackground],
                  pointerEvents: 'none',
                }}
              >
                {children}
              </div>
              {renderPinsFor('render', renderEff.scale)}
            </div>
          </div>

          {/* Figma pane */}
          <div
            ref={setFigmaPaneRef}
            data-pane="figma"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerCancel={onCanvasPointerUp}
            onClick={(e) => handleCanvasClick(e, figmaPaneRef.current, 'figma')}
            onContextMenu={(e) => {
              if (annotateOn) e.preventDefault();
            }}
            className="relative h-full w-full overflow-hidden rounded-md border border-zinc-800 bg-[#0a0a0a]"
            style={{ cursor, touchAction: 'none' }}
          >
            <PaneLabel>Figma</PaneLabel>
            <div
              className="absolute left-0 top-0"
              style={makeContentLayerStyle(figmaEff, figmaSize ?? undefined)}
            >
              {figmaSize && (
                <div
                  className="absolute left-0 top-0"
                  style={{
                    width: figmaSize.width,
                    height: figmaSize.height,
                    pointerEvents: 'none',
                  }}
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img
                    src={figmaImage}
                    alt="Figma reference"
                    draggable={false}
                    className="block h-full w-full select-none"
                    style={{
                      imageRendering: figmaEff.scale >= 1 ? 'pixelated' : 'auto',
                    }}
                  />
                </div>
              )}
              {renderPinsFor('figma', figmaEff.scale)}
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={setOverlayCanvasRef}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
          onPointerCancel={onCanvasPointerUp}
          onClick={(e) =>
            handleCanvasClick(e, overlayCanvasRef.current, 'render')
          }
          onContextMenu={(e) => {
            if (annotateOn) e.preventDefault();
          }}
          className="relative h-[640px] w-full overflow-hidden rounded-md border border-zinc-800 bg-[#0a0a0a]"
          style={{ cursor, touchAction: 'none' }}
        >
          <div
            className="absolute left-0 top-0"
            style={makeContentLayerStyle(overlayEff, overlayContentBox)}
          >
            {/* Rendered React tree — bottom of stack */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                display: 'inline-block',
                width: 'max-content',
                background: COMPONENT_BG[componentBackground],
                opacity: showRender ? 1 : 0,
                pointerEvents: 'none',
              }}
            >
              {children}
            </div>

            {/* Figma image — top of stack, with opacity / clip */}
            {figmaSize && (
              <div
                className="absolute left-0 top-0"
                style={{
                  width: figmaSize.width,
                  height: figmaSize.height,
                  opacity: showFigma ? effectiveFigmaOpacity : 0,
                  clipPath: figmaClipPath,
                  WebkitClipPath: figmaClipPath,
                  pointerEvents: 'none',
                }}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img
                  src={figmaImage}
                  alt="Figma reference"
                  draggable={false}
                  className="block h-full w-full select-none"
                  style={{
                    imageRendering: overlayEff.scale >= 1 ? 'pixelated' : 'auto',
                  }}
                />
              </div>
            )}

            {renderPinsFor('all', overlayEff.scale)}
          </div>

          {swipeActive && (
            <SwipeDivider
              percent={swipePercent}
              onChange={setSwipePercent}
              canvasRef={overlayCanvasRef}
            />
          )}
        </div>
      )}

      {popoverNode}

      <PinDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        pins={pins}
        onFocusPin={focusOnPin}
        onChangePin={updatePin}
        onDeletePin={removePin}
      />
    </div>
  );
}

function PaneLabel({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-2 top-2 z-20 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                            */
/* ------------------------------------------------------------------ */

type ToolbarProps = {
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  layerMode: LayerMode;
  onLayerModeChange: (m: LayerMode) => void;
  showOpacityControl: boolean;
  figmaOpacity: number;
  onFigmaOpacityChange: (v: number) => void;
  swipeOn: boolean;
  onSwipeChange: (v: boolean) => void;
  swipePercent: number;
  onSwipePercentChange: (v: number) => void;
  /** The relative zoom multiplier (1 = base fit). */
  zoomMultiplier: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomTo: (v: number | 'fit') => void;
  zoomMenuOpen: boolean;
  onZoomMenuOpenChange: (v: boolean) => void;
  annotateOn: boolean;
  onAnnotateChange: (v: boolean) => void;
  onExport: () => void;
  renderedSize: { width: number; height: number };
  figmaSize: { width: number; height: number } | null;
  componentLabel?: string;
  frameLabel?: string;
  figmaNodeUrl?: string;
};

function Toolbar(props: ToolbarProps) {
  const {
    mode,
    onModeChange,
    layerMode,
    onLayerModeChange,
    showOpacityControl,
    figmaOpacity,
    onFigmaOpacityChange,
    swipeOn,
    onSwipeChange,
    swipePercent,
    onSwipePercentChange,
    zoomMultiplier,
    onZoomIn,
    onZoomOut,
    onZoomTo,
    zoomMenuOpen,
    onZoomMenuOpenChange,
    annotateOn,
    onAnnotateChange,
    onExport,
    renderedSize,
    figmaSize,
    componentLabel,
    frameLabel,
    figmaNodeUrl,
  } = props;

  const sliderValue = swipeOn ? swipePercent : figmaOpacity;
  const sliderLabel = swipeOn ? 'Swipe' : 'Figma opacity';
  const overlayActive = mode === 'overlay';

  return (
    <div className="flex h-12 flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs text-zinc-700">
      {/* Labels */}
      {(componentLabel || frameLabel) && (
        <div className="flex items-center gap-1.5 pr-1">
          {componentLabel && (
            <span className="font-medium text-zinc-800">{componentLabel}</span>
          )}
          {componentLabel && frameLabel && (
            <span aria-hidden className="text-zinc-300">
              ·
            </span>
          )}
          {frameLabel && <span className="text-zinc-500">{frameLabel}</span>}
          <Divider />
        </div>
      )}

      {/* View mode toggle */}
      <button
        type="button"
        aria-pressed={overlayActive}
        onClick={() => onModeChange(overlayActive ? 'split' : 'overlay')}
        className={cn(
          'h-7 rounded border px-2 text-xs font-medium transition-colors',
          overlayActive
            ? 'border-zinc-900 bg-zinc-900 text-white'
            : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100',
        )}
        title="Toggle overlay mode (stacks the two views with opacity blending)"
      >
        Overlay mode
      </button>

      <Divider />

      {/* Layer toggle — overlay only */}
      {overlayActive && (
        <>
          <div role="tablist" aria-label="Layer visibility" className="flex items-center gap-0.5 rounded border border-zinc-200 bg-white p-0.5">
            {(['render', 'figma', 'both'] as LayerMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={layerMode === m}
                onClick={() => onLayerModeChange(m)}
                className={cn(
                  'h-7 rounded px-2 text-xs font-medium transition-colors',
                  layerMode === m
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100',
                )}
              >
                {m === 'render' ? 'Render' : m === 'figma' ? 'Figma' : 'Both'}
              </button>
            ))}
          </div>

          <Divider />

          {/* Opacity / Swipe slider — only visible in 'both' */}
          {showOpacityControl && (
            <label className="flex items-center gap-2">
              <span className="text-zinc-500">{sliderLabel}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={sliderValue}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (swipeOn) onSwipePercentChange(v);
                  else onFigmaOpacityChange(v);
                }}
                className="h-1 w-28 cursor-pointer accent-zinc-900"
                aria-label={sliderLabel}
              />
              <span className="w-9 tabular-nums text-zinc-500">{sliderValue}%</span>
            </label>
          )}

          {/* Swipe toggle */}
          {layerMode === 'both' && (
            <button
              type="button"
              aria-pressed={swipeOn}
              onClick={() => onSwipeChange(!swipeOn)}
              className={cn(
                'h-7 rounded border px-2 text-xs font-medium transition-colors',
                swipeOn
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100',
              )}
            >
              Swipe
            </button>
          )}

          <Divider />
        </>
      )}

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <ToolbarIconButton ariaLabel="Zoom out" onClick={onZoomOut}>
          <span className="text-base leading-none">−</span>
        </ToolbarIconButton>
        <div className="relative">
          <button
            type="button"
            onClick={() => onZoomMenuOpenChange(!zoomMenuOpen)}
            className="h-7 min-w-[56px] rounded border border-zinc-200 bg-white px-2 text-xs font-medium tabular-nums text-zinc-700 hover:bg-zinc-100"
            aria-haspopup="menu"
            aria-expanded={zoomMenuOpen}
          >
            {Math.round(zoomMultiplier * 100)}%
          </button>
          {zoomMenuOpen && (
            <div
              role="menu"
              className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[100px] rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
              onMouseLeave={() => onZoomMenuOpenChange(false)}
            >
              {ZOOM_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onZoomTo(p.value);
                    onZoomMenuOpenChange(false);
                  }}
                  className="block w-full px-3 py-1 text-left text-xs text-zinc-700 hover:bg-zinc-100"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <ToolbarIconButton ariaLabel="Zoom in" onClick={onZoomIn}>
          <span className="text-base leading-none">+</span>
        </ToolbarIconButton>
      </div>

      <Divider />

      {/* Annotate */}
      <button
        type="button"
        aria-pressed={annotateOn}
        onClick={() => onAnnotateChange(!annotateOn)}
        className={cn(
          'flex h-7 items-center gap-1.5 rounded border px-2 text-xs font-medium transition-colors',
          annotateOn
            ? 'border-zinc-900 bg-zinc-900 text-white'
            : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100',
        )}
        title="Toggle pin mode (P)"
      >
        <PinGlyph />
        <span>Pin</span>
      </button>

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        className="h-7 rounded border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
      >
        Export pins
      </button>

      {/* Right-side meta */}
      <div className="ml-auto flex items-center gap-2 text-zinc-500">
        <span>
          rendered:{' '}
          <span className="tabular-nums text-zinc-700">
            {renderedSize.width || '—'} × {renderedSize.height || '—'} css px
          </span>
        </span>
        <span aria-hidden className="text-zinc-300">
          |
        </span>
        <span>
          figma:{' '}
          <span className="tabular-nums text-zinc-700">
            {figmaSize ? `${figmaSize.width} × ${figmaSize.height} px` : '—'}
          </span>
        </span>
        <span aria-hidden className="text-zinc-300">
          |
        </span>
        <span>
          zoom:{' '}
          <span className="tabular-nums text-zinc-700">
            {Math.round(zoomMultiplier * 100)}%
          </span>
        </span>
        {figmaNodeUrl && (
          <>
            <span aria-hidden className="text-zinc-300">
              |
            </span>
            <a
              href={figmaNodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 hover:decoration-zinc-500"
            >
              Open in Figma
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px bg-zinc-200" />;
}

function ToolbarIconButton({
  ariaLabel,
  onClick,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
    >
      {children}
    </button>
  );
}

function PinGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 1.5 L11 4.5 L13 4 L12 7 L9 9 L9 14.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pin handle (circle)                                                */
/* ------------------------------------------------------------------ */

type PinHandleProps = {
  pin: Pin;
  /** Effective on-screen scale of the OWNING pane. */
  zoom: number;
  selected: boolean;
  onSelect: () => void;
  onDragMove: (dx: number, dy: number) => void;
  onDragStart: (pointerId: number) => void;
  onDragEnd: () => void;
};

function PinHandle({
  pin,
  zoom,
  selected,
  onSelect,
  onDragMove,
  onDragStart,
  onDragEnd,
}: PinHandleProps) {
  const dragRef = useRef<{
    pointerId: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = {
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    };
    onDragStart(e.pointerId);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    const dx = e.clientX - st.lastX;
    const dy = e.clientY - st.lastY;
    if (Math.abs(dx) + Math.abs(dy) < 1) return;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.moved = true;
    onDragMove(dx, dy);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    const moved = st.moved;
    dragRef.current = null;
    onDragEnd();
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (!moved) {
      onSelect();
    }
  };

  // Counter-scale by 1/zoom so the on-screen pin is constant size.
  const safeZoom = zoom > 0 ? zoom : 1;
  return (
    <div
      data-pin-handle="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => e.stopPropagation()}
      className="absolute"
      style={{
        left: pin.x,
        top: pin.y,
        transform: `translate(-50%, -50%) scale(${1 / safeZoom})`,
        transformOrigin: 'center center',
        width: PIN_SIZE,
        height: PIN_SIZE,
        cursor: 'pointer',
      }}
    >
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md',
          selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]' : '',
        )}
        style={{
          background: PIN_STATUS_COLOR[pin.status],
          border: '2px solid #ffffff',
        }}
      >
        {pin.number}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pin popover                                                        */
/* ------------------------------------------------------------------ */

type PinPopoverProps = {
  pin: Pin;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  onChange: (patch: Partial<Pin>) => void;
  onDelete: () => void;
};

function PinPopover({
  pin,
  anchorX,
  anchorY,
  onClose,
  onChange,
  onDelete,
}: PinPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      const t = e.target as HTMLElement;
      if (t.closest('[data-pin-handle="true"]')) return;
      onClose();
    };
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', onDocClick);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [onClose]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const POPOVER_W = 240;
  const POPOVER_H = 180;
  const OFFSET = 20;
  const left = Math.max(8, Math.min(anchorX + OFFSET, anchorX + OFFSET));
  const top = Math.max(8, anchorY - POPOVER_H / 2);

  return (
    <div
      ref={ref}
      data-pin-popover="true"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-40 rounded-md border border-zinc-200 bg-white shadow-xl"
      style={{
        left,
        top,
        width: POPOVER_W,
      }}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: PIN_STATUS_COLOR[pin.status] }}
          >
            {pin.number}
          </div>
          <select
            value={pin.status}
            onChange={(e) =>
              onChange({ status: e.target.value as PinStatus })
            }
            className="h-6 rounded border border-zinc-200 bg-white px-1 text-xs text-zinc-700"
          >
            <option value="open">Open</option>
            <option value="fixed">Fixed</option>
            <option value="wontfix">Won't fix</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="Delete pin"
        >
          Delete
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={pin.note}
        onChange={(e) => onChange({ note: e.target.value })}
        onKeyDown={onKeyDown}
        placeholder="Note…"
        className="block w-full resize-none border-0 bg-transparent px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none"
        rows={5}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Swipe divider (screen-space)                                       */
/* ------------------------------------------------------------------ */

function SwipeDivider({
  percent,
  onChange,
  canvasRef,
}: {
  percent: number;
  onChange: (v: number) => void;
  canvasRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const node = canvasRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) return;
    const raw = ((e.clientX - rect.left) / rect.width) * 100;
    onChange(Math.max(0, Math.min(100, raw)));
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(false);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-px bg-white/70"
        style={{ left: `${percent}%` }}
      />
      <div
        role="slider"
        aria-label="Swipe divider"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute top-1/2 z-30 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-md hover:border-zinc-400"
        style={{ left: `${percent}%` }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
          <path
            d="M5 3 L2 7 L5 11 M9 3 L12 7 L9 11"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pin drawer                                                         */
/* ------------------------------------------------------------------ */

type PinDrawerProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pins: Pin[];
  onFocusPin: (pin: Pin) => void;
  onChangePin: (id: string, patch: Partial<Pin>) => void;
  onDeletePin: (id: string) => void;
};

function PinDrawer({
  open,
  onOpenChange,
  pins,
  onFocusPin,
  onChangePin,
  onDeletePin,
}: PinDrawerProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-9 w-full items-center justify-between px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span>Pins</span>
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-600">
            {pins.length}
          </span>
        </span>
        <span aria-hidden className="text-zinc-400">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <div className="max-h-[160px] overflow-y-auto border-t border-zinc-100">
          {pins.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-zinc-400">
              No pins yet. Press <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1">P</kbd> to enter pin mode.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {pins.map((pin) => (
                <li
                  key={pin.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50"
                >
                  <button
                    type="button"
                    onClick={() => onFocusPin(pin)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <div
                      className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: PIN_STATUS_COLOR[pin.status] }}
                    >
                      {pin.number}
                    </div>
                    <span className="line-clamp-1 flex-1 text-xs text-zinc-700">
                      {pin.note || (
                        <span className="italic text-zinc-400">no note</span>
                      )}
                    </span>
                  </button>
                  <select
                    value={pin.status}
                    onChange={(e) =>
                      onChangePin(pin.id, { status: e.target.value as PinStatus })
                    }
                    className="h-6 rounded border border-zinc-200 bg-white px-1 text-[11px] text-zinc-600"
                  >
                    <option value="open">Open</option>
                    <option value="fixed">Fixed</option>
                    <option value="wontfix">Won't fix</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => onDeletePin(pin.id)}
                    className="rounded px-1.5 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                    aria-label="Delete pin"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
