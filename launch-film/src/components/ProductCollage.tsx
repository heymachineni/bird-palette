import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SPRING } from "../motion/easings";
import { MUSEUM_SLOTS, type Slot } from "./Collage";
import { SafeImage } from "./SafeImage";
import { paper, withAlpha } from "../theme/colors";

/**
 * Human-made colorful products collage (Scene 3). Real objects and designs
 * arranged in the same museum-wall rhythm as the nature collage.
 */
export const ProductCollage: React.FC<{
  images: string[];
  slots?: Slot[];
  start: number;
  step?: number;
  aspect?: number;
  cardOpacity?: number;
}> = ({
  images,
  slots = MUSEUM_SLOTS,
  start,
  step = 4,
  aspect = 1.34,
  cardOpacity = 0.72,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {slots.map((slot, i) => {
        const delay = start + i * step;
        const s = spring({ frame: frame - delay, fps, config: SPRING.SOFT });
        const drift = Math.sin((frame + i * 40) / 80) * 4;
        const h = slot.w * aspect;
        const src = images[i % images.length];

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
              transform: `translateY(${(1 - s) * 22 + drift}px) rotate(${slot.rot}deg) scale(${interpolate(
                s,
                [0, 1],
                [0.94, 1],
              )})`,
              opacity: s * cardOpacity,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: `0 24px 60px ${withAlpha("#000000", 0.16)}`,
              border: `1px solid ${paper.hairline}`,
              background: paper.panel,
            }}
          >
            <SafeImage
              src={src}
              fallbackColor={paper.panel}
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
