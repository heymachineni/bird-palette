"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { BirdSummary } from "@/types/bird";
import { cn } from "@/lib/utils";
import {
  BirdDetailContent,
  type PhotoExpandLayout,
} from "./bird-detail-content";

export function BirdDetailModal({
  bird,
  allBirds,
  onClose,
  onSelectBird,
}: {
  bird: BirdSummary | null;
  allBirds: BirdSummary[];
  onClose: () => void;
  onSelectBird: (bird: BirdSummary) => void;
}) {
  const open = bird !== null;
  const prevOpen = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const scrollRef = useRef<HTMLDivElement>(null);
  const collapsePhotoRef = useRef<(() => void) | null>(null);
  const [expandLayout, setExpandLayout] = useState<PhotoExpandLayout>({
    expanded: false,
    animating: false,
    imageAspect: null,
    collapsePhoto: () => {},
  });

  const onExpandLayoutChange = useCallback((layout: PhotoExpandLayout) => {
    collapsePhotoRef.current = layout.collapsePhoto;
    setExpandLayout(layout);
  }, []);

  useEffect(() => {
    setExpandLayout({
      expanded: false,
      animating: false,
      imageAspect: null,
      collapsePhoto: () => {},
    });
  }, [bird?.slug]);

  const bySlug = useMemo(
    () => new Map(allBirds.map((b) => [b.slug, b])),
    [allBirds],
  );

  const related = useMemo(() => {
    if (!bird) return [];
    return bird.similar
      .map((slug) => bySlug.get(slug))
      .filter((b): b is BirdSummary => Boolean(b))
      .slice(0, 4);
  }, [bird, bySlug]);

  const dismissOrCollapse = useCallback(() => {
    if (expandLayout.expanded) {
      collapsePhotoRef.current?.();
      return;
    }
    onCloseRef.current();
  }, [expandLayout.expanded]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissOrCollapse();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismissOrCollapse]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: 0 });
  }, [bird?.slug, open]);

  useEffect(() => {
    if (!open && prevOpen.current) {
      prevOpen.current = false;
      return;
    }

    if (!open || !bird) {
      prevOpen.current = open;
      return;
    }

    const path = `/birds/${bird.slug}`;
    const alreadyOnPath = window.location.pathname === path;

    if (!prevOpen.current) {
      if (alreadyOnPath) {
        window.history.replaceState({ birdModal: true }, "", path);
      } else {
        window.history.pushState({ birdModal: true }, "", path);
      }
    } else {
      window.history.replaceState({ birdModal: true }, "", path);
    }
    prevOpen.current = true;
  }, [open, bird?.slug, bird]);

  useEffect(() => {
    const onPop = () => {
      if (prevOpen.current) onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (!open || !bird) return null;

  const photoExpanded = expandLayout.expanded;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${bird.name} palette`}
    >
      <button
        type="button"
        aria-label={photoExpanded ? "Collapse image" : "Close"}
        onClick={dismissOrCollapse}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-[3px] animate-in fade-in"
      />

      <div
        className={cn(
          "relative z-10 flex w-full max-w-[1200px] flex-col gap-3 sm:block",
          !photoExpanded && "max-h-[calc(100dvh-1.5rem)] sm:max-h-none",
        )}
      >
        {!photoExpanded ? (
          <button
            type="button"
            aria-label="Close"
            onClick={dismissOrCollapse}
            className={cn(
              "absolute -top-12 right-0 hidden size-10 place-items-center rounded-full",
              "border border-border bg-background/95 text-foreground shadow-lg backdrop-blur",
              "transition-colors hover:bg-muted sm:grid",
            )}
          >
            <X className="size-4" />
          </button>
        ) : null}

        <div
          className={cn(
            "flex w-full min-h-0 flex-col overflow-hidden bg-background shadow-2xl shadow-black/25 duration-300 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95",
            photoExpanded
              ? "max-h-[86dvh] w-full rounded-[28px] sm:rounded-[32px]"
              : "min-h-0 flex-1 rounded-[32px] sm:max-h-[86vh] sm:flex-none sm:rounded-[40px]",
          )}
        >
          <div
            ref={scrollRef}
            className={cn(
              "no-scrollbar flex-1 overscroll-contain",
              photoExpanded ? "overflow-hidden" : "overflow-y-auto",
            )}
          >
            <div className={cn(photoExpanded ? "h-full p-0" : "p-4 sm:p-8")}>
              <BirdDetailContent
                bird={bird}
                related={related}
                onSelectBird={onSelectBird}
                onExpandLayoutChange={onExpandLayoutChange}
              />
            </div>
          </div>
        </div>

        {!photoExpanded ? (
          <button
            type="button"
            aria-label="Close"
            onClick={dismissOrCollapse}
            className={cn(
              "flex w-full shrink-0 items-center justify-center rounded-full",
              "border border-border bg-background/95 py-2.5 text-sm font-medium text-foreground",
              "shadow-lg backdrop-blur transition-colors hover:bg-muted active:scale-[0.99] sm:hidden",
            )}
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
