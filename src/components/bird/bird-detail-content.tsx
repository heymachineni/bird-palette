"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BirdSummary } from "@/types/bird";
import { BirdAbout } from "@/components/bird/bird-about";
import { PaletteStudy } from "@/components/bird/palette-study";
import { BirdThumbnail } from "@/components/home/bird-thumbnail";
import { PhotoPalettePicker } from "@/components/bird/photo-palette-picker";
import { cn } from "@/lib/utils";

const LAYOUT_MS = 420;
const EXPANDED_MAX_H = "80dvh";

export type PhotoExpandLayout = {
  expanded: boolean;
  animating: boolean;
  imageAspect: number | null;
  collapsePhoto: () => void;
};

export function BirdDetailContent({
  bird,
  related,
  onSelectBird,
  onExpandLayoutChange,
}: {
  bird: BirdSummary;
  related: BirdSummary[];
  onSelectBird?: (bird: BirdSummary) => void;
  onExpandLayoutChange?: (layout: PhotoExpandLayout) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [layoutAnimating, setLayoutAnimating] = useState(false);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const layoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setExpanded(false);
    setLayoutAnimating(false);
    setImageAspect(null);
  }, [bird.slug]);

  const clearLayoutTimer = useCallback(() => {
    if (layoutTimerRef.current) {
      clearTimeout(layoutTimerRef.current);
      layoutTimerRef.current = null;
    }
  }, []);

  const setExpandedAnimated = useCallback(
    (next: boolean) => {
      clearLayoutTimer();
      setLayoutAnimating(true);
      setExpanded(next);
      layoutTimerRef.current = setTimeout(() => {
        setLayoutAnimating(false);
        layoutTimerRef.current = null;
      }, LAYOUT_MS);
    },
    [clearLayoutTimer],
  );

  useEffect(() => {
    return () => clearLayoutTimer();
  }, [clearLayoutTimer]);

  useEffect(() => {
    onExpandLayoutChange?.({
      expanded,
      animating: layoutAnimating,
      imageAspect,
      collapsePhoto: () => setExpandedAnimated(false),
    });
  }, [expanded, layoutAnimating, imageAspect, onExpandLayoutChange, setExpandedAnimated]);

  useEffect(() => {
    if (!expanded) return;
    slotRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [expanded]);

  const onSlotTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== slotRef.current) return;
    if (e.propertyName === "width" || e.propertyName === "max-width") {
      setLayoutAnimating(false);
      clearLayoutTimer();
    }
  };

  const showAside = !expanded && !layoutAnimating;
  const lockExpandedShell = expanded || layoutAnimating;
  const expandedAspect = imageAspect ?? 4 / 3;

  return (
    <article>
      <header>
        <div
          className={cn(
            "flex transition-[gap] duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none",
            expanded
              ? "flex-col"
              : "flex-col gap-4 sm:flex-row sm:items-start lg:gap-6",
          )}
        >
          <div
            ref={slotRef}
            onTransitionEnd={onSlotTransitionEnd}
            className={cn(
              "shrink-0 transition-all duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none",
              expanded
                ? "mx-auto w-full max-w-full"
                : "w-full max-w-[280px] sm:max-w-[220px] lg:max-w-none lg:w-[calc((100%-3.75rem)/4)]",
              lockExpandedShell && "max-h-[80dvh]",
            )}
            style={
              lockExpandedShell
                ? { aspectRatio: expandedAspect, maxHeight: EXPANDED_MAX_H }
                : undefined
            }
          >
            <PhotoPalettePicker
              src={bird.imageUrl}
              alt={bird.name}
              priority
              expanded={expanded}
              onExpandedChange={setExpandedAnimated}
              samplingPaused={layoutAnimating}
              onImageAspect={setImageAspect}
            />
          </div>

          {!showAside ? null : (
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-xl leading-[1.1] tracking-tight text-foreground sm:text-2xl lg:text-3xl lg:leading-[1.05]">
                {bird.name}
              </h1>
              <p className="mt-1 font-serif text-xs italic text-muted-foreground sm:text-sm">
                {bird.scientificName}
              </p>
              <BirdAbout
                commonName={bird.name}
                scientificName={bird.scientificName}
                className="mt-3 sm:mt-4 lg:mt-3"
              />
            </div>
          )}
        </div>
      </header>

      {showAside && (
        <>
          <PaletteStudy colors={bird.colors} />

          {related.length > 0 && (
            <section className="mt-12 sm:mt-16">
              <div className="mb-5">
                <h2 className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
                  Related palettes
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Birds with a similar combination
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
                {related.map((b) => (
                  <BirdThumbnail key={b.slug} bird={b} onOpen={onSelectBird} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </article>
  );
}
