"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { toastCopiedHex, toastError } from "@/lib/copy-color-toast";
import {
  clientAfterZoomPan,
  objectContainPixelAt,
  objectCoverPixelAt,
  rgbToHex,
} from "@/lib/color/match-palette";
import { paletteHaptic } from "@/lib/haptics";
import { loadSampleProbeWithRetry } from "@/lib/photos/load-sample-image";
import { sampleProbeUrls } from "@/lib/photos/sample-url";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CollapsePhotoIcon, ExpandPhotoIcon } from "@/components/bird/photo-expand-icons";

const MAX_SAMPLE_EDGE = 640;
const HOLD_MS = 280;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const PAN_DRAG_PX = 10;

/** Hover pill layout — all spacing in px for predictable positioning. */
const HOVER_PILL = {
  padX: 8,
  gap: 6,
  swatch: 12,
  fontSize: 10,
  offsetX: 10,
  offsetY: 10,
  edge: 8,
  height: 24,
} as const;

type Preview = {
  hex: string;
  x: number;
  y: number;
};

type ViewTransform = {
  zoom: number;
  panX: number;
  panY: number;
};

type PhotoPalettePickerProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  samplingPaused?: boolean;
  onImageAspect?: (aspect: number) => void;
};

function isHoverPointer(type: string) {
  return type === "mouse" || type === "pen";
}

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function PhotoPalettePicker({
  src,
  alt,
  className,
  priority = false,
  expanded = false,
  onExpandedChange,
  samplingPaused = false,
  onImageAspect,
}: PhotoPalettePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sampleImgRef = useRef<HTMLImageElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchHoldingRef = useRef(false);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const panDragRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const viewRef = useRef<ViewTransform>({ zoom: MIN_ZOOM, panX: 0, panY: 0 });

  const [loaded, setLoaded] = useState(false);
  const [sampleState, setSampleState] = useState<
    "loading" | "ready" | "failed"
  >("loading");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [expandControlHover, setExpandControlHover] = useState(false);
  const [multiTouch, setMultiTouch] = useState(false);
  const [view, setView] = useState<ViewTransform>({
    zoom: MIN_ZOOM,
    panX: 0,
    panY: 0,
  });

  viewRef.current = view;

  const canPick = sampleState === "ready" && !samplingPaused && !multiTouch;

  const reportAspect = useCallback(
    (width: number, height: number) => {
      if (width > 0 && height > 0) onImageAspect?.(width / height);
    },
    [onImageAspect],
  );

  useEffect(() => {
    setPreview(null);
    setView({ zoom: MIN_ZOOM, panX: 0, panY: 0 });
    pointersRef.current.clear();
    pinchRef.current = null;
    panDragRef.current = null;
    setMultiTouch(false);
  }, [expanded, samplingPaused, src]);

  useEffect(() => {
    setCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    setLoaded(false);
    setSampleState("loading");
    sampleImgRef.current = null;
    sampleCanvasRef.current = null;

    void loadSampleProbeWithRetry(sampleProbeUrls(src)).then((img) => {
      if (cancelled) return;
      if (img) {
        sampleImgRef.current = img;
        reportAspect(img.naturalWidth, img.naturalHeight);
        setSampleState("ready");
      } else {
        setSampleState("failed");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src, reportAspect]);

  const ensureSampleCanvas = useCallback((): CanvasRenderingContext2D | null => {
    const img = sampleImgRef.current;
    if (!img?.naturalWidth) return null;

    let canvas = sampleCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      sampleCanvasRef.current = canvas;
    }

    const scale = Math.min(
      1,
      MAX_SAMPLE_EDGE / Math.max(img.naturalWidth, img.naturalHeight),
    );
    canvas.width = Math.max(1, Math.floor(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    try {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return ctx;
    } catch {
      return null;
    }
  }, []);

  const sampleAt = useCallback(
    (clientX: number, clientY: number): string | null => {
      const container = containerRef.current;
      const img = sampleImgRef.current;
      if (!container || !img?.naturalWidth || !canPick) return null;

      const box = container.getBoundingClientRect();
      const mapped =
        expanded && (view.zoom !== 1 || view.panX !== 0 || view.panY !== 0)
          ? clientAfterZoomPan(
              clientX,
              clientY,
              box,
              view.zoom,
              view.panX,
              view.panY,
            )
          : { x: clientX, y: clientY };

      const pixel = expanded
        ? objectContainPixelAt(img, mapped.x, mapped.y, box)
        : objectCoverPixelAt(img, mapped.x, mapped.y, box);
      if (!pixel) return null;

      const ctx = ensureSampleCanvas();
      if (!ctx) return null;

      const scaleX = ctx.canvas.width / img.naturalWidth;
      const scaleY = ctx.canvas.height / img.naturalHeight;
      const sx = Math.min(ctx.canvas.width - 1, Math.floor(pixel.x * scaleX));
      const sy = Math.min(ctx.canvas.height - 1, Math.floor(pixel.y * scaleY));

      try {
        const [r, g, b, a] = ctx.getImageData(sx, sy, 1, 1).data;
        if (a < 32) return null;
        return rgbToHex(r, g, b);
      } catch {
        return null;
      }
    },
    [canPick, ensureSampleCanvas, expanded, view],
  );

  const updatePreview = useCallback(
    (clientX: number, clientY: number) => {
      const hex = sampleAt(clientX, clientY);
      if (!hex) {
        setPreview(null);
        return;
      }

      const container = containerRef.current;
      if (!container) return;
      const box = container.getBoundingClientRect();
      setPreview({
        hex,
        x: clientX - box.left,
        y: clientY - box.top,
      });
    },
    [sampleAt],
  );

  const copyHex = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      toastCopiedHex(hex);
      paletteHaptic("copy");
    } catch {
      toastError("Couldn't copy");
    }
  }, []);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const syncPinchZoom = useCallback(() => {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) return;

    const dist = pointerDistance(pts[0], pts[1]);
    if (!pinchRef.current) {
      pinchRef.current = { distance: dist, zoom: viewRef.current.zoom };
      return;
    }

    const nextZoom = clampZoom(
      pinchRef.current.zoom * (dist / pinchRef.current.distance),
    );
    setView((prev) => ({
      ...prev,
      zoom: nextZoom,
      panX: nextZoom <= MIN_ZOOM ? 0 : prev.panX,
      panY: nextZoom <= MIN_ZOOM ? 0 : prev.panY,
    }));
  }, []);

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!expanded || !canPick) return;
    e.preventDefault();
    setPreview(null);
    const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    setView((prev) => {
      const nextZoom = clampZoom(prev.zoom * factor);
      return {
        zoom: nextZoom,
        panX: nextZoom <= MIN_ZOOM ? 0 : prev.panX,
        panY: nextZoom <= MIN_ZOOM ? 0 : prev.panY,
      };
    });
  };

  const onHoverPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canPick || !isHoverPointer(e.pointerType) || expandControlHover) return;
    updatePreview(e.clientX, e.clientY);
  };

  const onPointerLeave = () => {
    clearHoldTimer();
    touchHoldingRef.current = false;
    touchStartRef.current = null;
    panDragRef.current = null;
    setPreview(null);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      clearHoldTimer();
      touchHoldingRef.current = false;
      panDragRef.current = null;
      setPreview(null);
      setMultiTouch(true);
      pinchRef.current = null;
      syncPinchZoom();
      return;
    }

    if (!canPick || isHoverPointer(e.pointerType)) return;

    clearHoldTimer();
    touchHoldingRef.current = false;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    panDragRef.current = null;
    containerRef.current?.setPointerCapture(e.pointerId);
    holdTimerRef.current = setTimeout(() => {
      if (panDragRef.current) return;
      touchHoldingRef.current = true;
      updatePreview(e.clientX, e.clientY);
      paletteHaptic("tick");
    }, HOLD_MS);
  };

  const onTouchPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2 && expanded) {
      setPreview(null);
      setMultiTouch(true);
      syncPinchZoom();
      return;
    }

    if (!canPick || isHoverPointer(e.pointerType)) return;

    const start = touchStartRef.current;
    if (
      expanded &&
      view.zoom > MIN_ZOOM &&
      start &&
      !touchHoldingRef.current &&
      !panDragRef.current
    ) {
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (moved > PAN_DRAG_PX) {
        clearHoldTimer();
        panDragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          panX: view.panX,
          panY: view.panY,
        };
      }
    }

    if (panDragRef.current) {
      setPreview(null);
      const drag = panDragRef.current;
      setView((prev) => ({
        ...prev,
        panX: drag.panX + (e.clientX - drag.startX),
        panY: drag.panY + (e.clientY - drag.startY),
      }));
      return;
    }

    if (!touchHoldingRef.current) return;
    updatePreview(e.clientX, e.clientY);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
      setMultiTouch(false);
    }

    if (isHoverPointer(e.pointerType)) return;

    clearHoldTimer();
    containerRef.current?.releasePointerCapture(e.pointerId);

    const hex = sampleAt(e.clientX, e.clientY);
    if (hex && touchHoldingRef.current) {
      void copyHex(hex);
    }

    touchHoldingRef.current = false;
    touchStartRef.current = null;
    panDragRef.current = null;
    if (pointersRef.current.size === 0) setPreview(null);
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canPick || coarsePointer || multiTouch) return;
    const hex = sampleAt(e.clientX, e.clientY);
    if (hex) void copyHex(hex);
  };

  const pillLeft = preview
    ? Math.min(
        Math.max(HOVER_PILL.edge, preview.x + HOVER_PILL.offsetX),
        (containerRef.current?.clientWidth ?? 0) - HOVER_PILL.edge - 120,
      )
    : 0;

  const pillTop = preview
    ? Math.max(HOVER_PILL.edge, preview.y - HOVER_PILL.offsetY - HOVER_PILL.height)
    : 0;

  const transformStyle = expanded
    ? {
        transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`,
      }
    : undefined;

  const ariaLabel = useMemo(() => {
    if (!canPick) return alt;
    if (expanded) {
      return coarsePointer
        ? "Bird photo — pinch to zoom, hold for color codes"
        : "Bird photo — scroll to zoom, hover for color codes, click to copy";
    }
    return coarsePointer
      ? "Bird photo — hold for color codes, release to copy"
      : "Bird photo — hover for color codes, click to copy";
  }, [alt, canPick, coarsePointer, expanded]);

  return (
    <div
      className={cn(
        "transition-all duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none",
        expanded
          ? "h-full w-full rounded-none bg-background p-0"
          : "rounded-2xl bg-muted/70 p-2",
        className,
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative w-full overflow-hidden transition-all duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none",
          expanded ? "h-full rounded-none" : "aspect-[4/3] rounded-xl",
          canPick && !multiTouch && "cursor-crosshair touch-none",
          multiTouch && "touch-none",
        )}
        aria-label={ariaLabel}
        onPointerMove={(e) => {
          onHoverPointerMove(e);
          onTouchPointerMove(e);
        }}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        onWheel={onWheel}
      >
        {onExpandedChange ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={expanded ? "Collapse" : "Expand"}
                  aria-expanded={expanded}
                  onPointerEnter={() => {
                    setExpandControlHover(true);
                    setPreview(null);
                  }}
                  onPointerLeave={() => setExpandControlHover(false)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    onExpandedChange(!expanded);
                  }}
                  className={cn(
                    "absolute right-2 top-2 z-20 grid size-7 place-items-center rounded-full",
                    "border border-border/80 bg-background/90 text-foreground shadow-md backdrop-blur",
                    "transition-colors hover:bg-muted",
                  )}
                >
                  {expanded ? (
                    <CollapsePhotoIcon className="size-4" />
                  ) : (
                    <ExpandPhotoIcon className="size-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="z-[100]">
                {expanded ? "Collapse" : "Expand"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}

        <div
          className={cn(
            "absolute inset-0 origin-center will-change-transform",
            expanded && view.zoom === MIN_ZOOM && "transition-transform duration-150",
          )}
          style={transformStyle}
        >
          {!loaded && (
            <div aria-hidden className="absolute inset-0 z-[1] bg-muted shimmer" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            referrerPolicy="no-referrer"
            draggable={false}
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full select-none transition-opacity duration-300",
              expanded ? "object-contain object-center" : "object-cover object-center",
              loaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={(e) => {
              const img = e.currentTarget;
              reportAspect(img.naturalWidth, img.naturalHeight);
              setLoaded(true);
            }}
            onError={() => setLoaded(true)}
          />
        </div>

        {preview && !expandControlHover && !multiTouch && (
          <div
            className="pointer-events-none absolute z-10 flex items-center rounded-full border border-border/80 bg-background/95 font-mono uppercase tracking-wide text-foreground shadow-md backdrop-blur"
            style={{
              left: pillLeft,
              top: pillTop,
              height: HOVER_PILL.height,
              paddingLeft: HOVER_PILL.padX,
              paddingRight: HOVER_PILL.padX,
              gap: HOVER_PILL.gap,
              fontSize: HOVER_PILL.fontSize,
            }}
          >
            <span
              className="shrink-0 rounded-full ring-1 ring-inset ring-black/10"
              style={{
                width: HOVER_PILL.swatch,
                height: HOVER_PILL.swatch,
                backgroundColor: preview.hex,
              }}
              aria-hidden
            />
            {preview.hex}
          </div>
        )}
      </div>

      {!expanded && sampleState === "ready" ? (
        <p className="mt-2 px-1 text-[11px] leading-snug text-muted-foreground">
          {coarsePointer
            ? "Hold on the image for color codes"
            : "Hover on the image for color codes"}
        </p>
      ) : !expanded && sampleState === "loading" ? (
        <p className="mt-2 px-1 text-[11px] leading-snug text-muted-foreground">
          Preparing color sampling…
        </p>
      ) : null}
    </div>
  );
}
