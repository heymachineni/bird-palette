import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, random } from "remotion";
import { SPRING } from "../motion/easings";
import { SafeImage } from "./SafeImage";
import { GRID_IMAGES, GRID_TINTS } from "../data/birds";
import { stage } from "../theme/colors";

/**
 * A responsive grid of bird cells that reveal with a soft, ordered stagger.
 * Reused for the Act 2 reveal and (denser) for the Act 7 mosaic.
 */
export const BirdGrid: React.FC<{
  columns: number;
  rows: number;
  start: number;
  step?: number;
  gap?: number;
  /** 0..1 base opacity multiplier for the whole grid. */
  opacity?: number;
  images?: string[];
}> = ({
  columns,
  rows,
  start,
  step = 2.2,
  gap = 14,
  opacity = 1,
  images = GRID_IMAGES,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = columns * rows;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap,
        padding: gap,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        // Reveal from center outward for a calmer feel.
        const col = i % columns;
        const row = Math.floor(i / columns);
        const dx = col - (columns - 1) / 2;
        const dy = row - (rows - 1) / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delay = start + dist * step;

        const s = spring({ frame: frame - delay, fps, config: SPRING.SOFT });
        const scale = interpolate(s, [0, 1], [0.86, 1]);
        const img = images[i % images.length];
        const tint = GRID_TINTS[i % GRID_TINTS.length];
        // Subtle per-cell breathing drift for life.
        const seed = random(`cell-${i}`);
        const drift = Math.sin((frame + seed * 120) / 70) * 4;

        return (
          <div
            key={i}
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: stage.panel,
              opacity: s * opacity,
              transform: `scale(${scale}) translateY(${drift}px)`,
            }}
          >
            <SafeImage
              src={img}
              fallbackColor={tint}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
