"use client";

import { useMemo } from "react";
import type { BirdSummary } from "@/types/bird";
import {
  buildColorIndex,
  formatBirdCount,
  formatFamilyLabel,
  getMainFamilySuggestions,
  suggestNearbyHexes,
} from "@/lib/color/nearby-colors";
import { cn } from "@/lib/utils";

function emptyCopy(pickedColor: string | null, query: string) {
  const trimmedQuery = query.trim();

  if (pickedColor && trimmedQuery) {
    return "Try a nearby shade or a color family below.";
  }

  if (pickedColor) {
    return "These shades and families appear on birds in the collection.";
  }

  return "Try a color name, or explore a family below.";
}

function SuggestionPill({
  hex,
  label,
  count,
  onClick,
  swatchClassName,
}: {
  hex: string;
  label: string;
  count: number;
  onClick: () => void;
  swatchClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background",
        "py-1 pl-1.5 pr-3 text-xs transition-colors hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "size-5 shrink-0 rounded-full ring-1 ring-inset ring-black/10",
          swatchClassName,
        )}
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <span className="truncate font-medium text-foreground">{label}</span>
      <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
        {formatBirdCount(count)}
      </span>
    </button>
  );
}

export function HomeEmptyState({
  pickedColor,
  query,
  birds,
  onPickColor,
  onQueryChange,
  onReset,
}: {
  pickedColor: string | null;
  query: string;
  birds: BirdSummary[];
  onPickColor: (hex: string | null) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
}) {
  const trimmedQuery = query.trim();

  const { nearbyHexes, mainFamilies } = useMemo(() => {
    const index = buildColorIndex(birds);
    return {
      nearbyHexes: pickedColor
        ? suggestNearbyHexes(pickedColor, index.hexStats)
        : [],
      mainFamilies: getMainFamilySuggestions(index.familyStats, pickedColor),
    };
  }, [birds, pickedColor]);

  const subtitle = emptyCopy(pickedColor, query);

  const tryFamily = (family: string) => {
    onPickColor(null);
    onQueryChange(family);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 py-20 text-center">
      {pickedColor && (
        <span
          className="size-14 rounded-full ring-1 ring-inset ring-black/10 shadow-sm"
          style={{ backgroundColor: pickedColor }}
          aria-hidden
        />
      )}

      <div className="space-y-2">
        <h2 className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
          {pickedColor && trimmedQuery ? (
            <>
              No birds wear{" "}
              <span className="font-mono text-lg uppercase sm:text-xl">
                {pickedColor}
              </span>{" "}
              and match &ldquo;{trimmedQuery}&rdquo;
            </>
          ) : pickedColor ? (
            <>
              No birds wear{" "}
              <span className="font-mono text-lg uppercase sm:text-xl">
                {pickedColor}
              </span>
            </>
          ) : (
            <>No birds match &ldquo;{trimmedQuery}&rdquo;</>
          )}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>

      {nearbyHexes.length > 0 && (
        <section className="w-full text-left">
          <h3 className="mb-3 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Nearby colors
          </h3>
          <div className="flex flex-wrap gap-2">
            {nearbyHexes.map((item) => (
              <SuggestionPill
                key={item.hex}
                hex={item.hex}
                label={item.hex}
                count={item.birdCount}
                onClick={() => onPickColor(item.hex)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="w-full text-left">
        <h3 className="mb-3 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Color families
        </h3>
        <div className="flex flex-wrap gap-2">
          {mainFamilies.map((item) => (
            <SuggestionPill
              key={item.family}
              hex={item.sampleHex}
              label={formatFamilyLabel(item.family)}
              count={item.birdCount}
              swatchClassName={
                item.family === "white" ? "ring-black/15" : undefined
              }
              onClick={() => tryFamily(item.family)}
            />
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-border bg-background px-5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        Show all birds
      </button>
    </div>
  );
}
