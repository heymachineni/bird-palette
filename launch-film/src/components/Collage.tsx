import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SPRING } from "../motion/easings";
import { SafeImage } from "./SafeImage";
import { paper, withAlpha } from "../theme/colors";

export type Slot = {
  /** Center position as 0..100 percentages. */
  x: number;
  y: number;
  /** Card width in px. */
  w: number;
  /** Rotation in degrees. */
  rot: number;
};

/**
 * Museum-wall slots: arranged around the perimeter so the center stays clear
 * and the headline remains readable. Deliberate, balanced -- not random.
 */
export const MUSEUM_SLOTS: Slot[] = [
  { x: 12, y: 17, w: 230, rot: -3 },
  { x: 33, y: 12, w: 205, rot: 2 },
  { x: 63, y: 12, w: 215, rot: -2 },
  { x: 86, y: 18, w: 235, rot: 3 },
  { x: 7, y: 44, w: 215, rot: 2 },
  { x: 93, y: 43, w: 220, rot: -3 },
  { x: 9, y: 72, w: 220, rot: -2 },
  { x: 92, y: 71, w: 210, rot: 3 },
  { x: 22, y: 87, w: 205, rot: 3 },
  { x: 44, y: 90, w: 200, rot: -2 },
  { x: 64, y: 89, w: 210, rot: 2 },
  { x: 82, y: 86, w: 225, rot: -3 },
];

/**
 * Collage cards pop in one-by-one at fixed positions with a subtle drift.
 */
export const Collage: React.FC<{
  images: string[];
  slots?: Slot[];
  start: number;
  step?: number;
  aspect?: number;
  cardOpacity?: number;
  fallbackColor?: string;
}> = ({
  images,
  slots = MUSEUM_SLOTS,
  start,
  step = 11,
  aspect = 1.34,
  cardOpacity = 0.62,
  fallbackColor = "#cfc8ba",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {slots.map((slot, i) => {
        const delay = start + i * step;
        if (frame < delay) return null;

        const s = spring({ frame: frame - delay, fps, config: SPRING.SETTLE });
        const drift = Math.sin((frame + i * 40) / 80) * 3;
        const h = slot.w * aspect;
        const img = images[i % Math.max(1, images.length)];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: slot.w,
              height: h,
              marginLeft: -slot.w / 2,
              marginTop: -h / 2,
              transform: `translateY(${(1 - s) * 36 + drift}px) rotate(${slot.rot}deg) scale(${interpolate(
                s,
                [0, 1],
                [0.84, 1],
              )})`,
              opacity: s * cardOpacity,
              borderRadius: 6,
              overflow: "hidden",
              backgroundColor: paper.panel,
              boxShadow: `0 24px 60px ${withAlpha("#000000", 0.16)}`,
              border: `1px solid ${paper.hairline}`,
            }}
          >
            <SafeImage
              src={img}
              fallbackColor={fallbackColor}
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
    </>
  );
};
