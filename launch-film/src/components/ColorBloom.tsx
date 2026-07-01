import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SPRING } from "../motion/easings";
import { withAlpha } from "../theme/colors";

export type BloomPoint = {
  /** Normalized 0..1 origin on the bird where the color is "pulled" from. */
  from: { x: number; y: number };
  /** Normalized 0..1 resting position the color drifts out to. */
  to: { x: number; y: number };
  /** Resting orb radius in px. */
  radius: number;
};

/**
 * Colors emerging from the bird: soft glowing orbs that are "pulled" from
 * feather points and drift outward to resting positions, growing and settling.
 * Not swatches, not charts -- light fields that imply the palette.
 */
export const ColorBloom: React.FC<{
  palette: string[];
  points: BloomPoint[];
  /** Frame (relative to Sequence) the bloom begins. */
  start: number;
  /** Stagger between colors, in frames. */
  step?: number;
}> = ({ palette, points, start, step = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {points.map((pt, i) => {
        const color = palette[i % palette.length];
        const delay = start + i * step;
        const s = spring({
          frame: frame - delay,
          fps,
          config: SPRING.SOFT,
        });
        const x = interpolate(s, [0, 1], [pt.from.x, pt.to.x]);
        const y = interpolate(s, [0, 1], [pt.from.y, pt.to.y]);
        const scale = s;
        const diameter = pt.radius * 2;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: diameter,
              height: diameter,
              marginLeft: -pt.radius,
              marginTop: -pt.radius,
              borderRadius: "50%",
              transform: `scale(${scale})`,
              opacity: s,
              background: `radial-gradient(circle at 50% 45%, ${color} 0%, ${withAlpha(
                color,
                0.85,
              )} 42%, ${withAlpha(color, 0)} 72%)`,
              boxShadow: `0 0 ${pt.radius * 1.6}px ${withAlpha(color, 0.55)}`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
};
