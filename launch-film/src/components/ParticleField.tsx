import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, random } from "remotion";
import { EASE_OUT } from "../motion/easings";
import { withAlpha } from "../theme/colors";

const WHEEL_HUES = [
  "#FF004D",
  "#FF6A00",
  "#FFD400",
  "#62D200",
  "#00C2A8",
  "#009BFF",
  "#3D3DFF",
  "#9B2DFF",
  "#FF2DAE",
];

/**
 * Soft color particles + light streaks that spill outward from the wheel
 * center, then are drawn back as the HEX value locks in. Fully deterministic.
 */
export const ParticleField: React.FC<{
  count?: number;
  start: number;
  duration: number;
  centerX?: number;
  centerY?: number;
  /** 0..1 — pulls particles back toward center near the end. */
  recall?: number;
  maxRadius?: number;
}> = ({
  count = 90,
  start,
  duration,
  centerX = 0.5,
  centerY = 0.5,
  recall = 0,
  maxRadius = 620,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = (k: string) => random(`p-${i}-${k}`);
        const angle = seed("a") * Math.PI * 2;
        const delay = start + seed("d") * 16;
        const reach = (0.45 + seed("r") * 0.55) * maxRadius;
        const size = 4 + seed("s") * 14;
        const color = WHEEL_HUES[Math.floor(seed("c") * WHEEL_HUES.length)];
        const streak = seed("k") > 0.7;

        const out = interpolate(frame, [delay, delay + duration], [0, 1], {
          easing: EASE_OUT,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const dist = reach * out * (1 - recall * 0.85);
        const x = centerX * width + Math.cos(angle) * dist;
        const y = centerY * height + Math.sin(angle) * dist;
        const opacity = interpolate(out, [0, 0.2, 0.8, 1], [0, 1, 0.9, 0.5]) * (1 - recall);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: streak ? size * 5 : size,
              height: size,
              marginLeft: streak ? -size * 2.5 : -size / 2,
              marginTop: -size / 2,
              borderRadius: 999,
              background: streak
                ? `linear-gradient(90deg, ${withAlpha(color, 0)}, ${color})`
                : `radial-gradient(circle, ${color} 0%, ${withAlpha(color, 0)} 70%)`,
              transform: `rotate(${(angle * 180) / Math.PI}deg)`,
              opacity,
              mixBlendMode: "screen",
              filter: "blur(0.4px)",
            }}
          />
        );
      })}
    </>
  );
};
