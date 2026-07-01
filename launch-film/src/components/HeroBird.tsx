import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeImage } from "./SafeImage";
import { ColorBloom, type BloomPoint } from "./ColorBloom";
import { type BirdPalette, withAlpha } from "../theme/colors";

/** Shared bloom geometry: colors pulled from the bird, drifting outward. */
export const BLOOM_POINTS: BloomPoint[] = [
  { from: { x: 0.5, y: 0.44 }, to: { x: 0.28, y: 0.32 }, radius: 150 },
  { from: { x: 0.52, y: 0.5 }, to: { x: 0.74, y: 0.36 }, radius: 116 },
  { from: { x: 0.47, y: 0.56 }, to: { x: 0.3, y: 0.7 }, radius: 92 },
  { from: { x: 0.51, y: 0.5 }, to: { x: 0.72, y: 0.68 }, radius: 78 },
];

/**
 * A bird presented large and centered, with its palette blooming from the
 * feathers and a soft ground glow in the hero color.
 */
export const HeroBird: React.FC<{
  bird: BirdPalette;
  /** Frame the bloom should begin (relative to enclosing Sequence). */
  bloomStart: number;
  /** Slow scale applied to the bird image, 0..1 progress from parent. */
  scale?: number;
  showBloom?: boolean;
  height?: number;
}> = ({ bird, bloomStart, scale = 1, showBloom = true, height = 760 }) => {
  return (
    <AbsoluteFill>
      {showBloom ? (
        <ColorBloom palette={bird.palette} points={BLOOM_POINTS} start={bloomStart} />
      ) : null}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* Ground glow in the hero color. */}
        <div
          style={{
            position: "absolute",
            width: height * 1.2,
            height: height * 1.2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${withAlpha(
              bird.palette[0],
              0.42,
            )} 0%, ${withAlpha(bird.palette[0], 0)} 60%)`,
            filter: "blur(8px)",
          }}
        />
        <div style={{ transform: `scale(${scale})` }}>
          <SafeImage
            src={bird.image}
            fallbackColor={bird.palette[0]}
            style={{
              width: height,
              height,
              objectFit: "contain",
              filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.55))",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
