import React from "react";
import { useCurrentFrame, interpolate, AbsoluteFill, type EasingFunction } from "remotion";
import { EASE_INOUT } from "./easings";

/**
 * CrossDissolve: fades and gently scales a layer in then out over a window.
 * Used to blend hero birds in Act 3 and scene-to-scene moments.
 */
export const CrossDissolve: React.FC<{
  inStart: number;
  inDur: number;
  outStart: number;
  outDur: number;
  children: React.ReactNode;
  scaleFrom?: number;
  style?: React.CSSProperties;
}> = ({ inStart, inDur, outStart, outDur, children, scaleFrom = 1.04, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [inStart, inStart + inDur, outStart, outStart + outDur],
    [0, 1, 1, 0],
    { easing: EASE_INOUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(
    frame,
    [inStart, outStart + outDur],
    [scaleFrom, 1],
    { easing: EASE_INOUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, ...style }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * PushIn: a slow camera push (scale + slight drift) applied to its children.
 * `progress` is a 0..1 value, typically derived from useBeat.
 */
export const PushIn: React.FC<{
  progress: number;
  from?: number;
  to?: number;
  driftY?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ progress, from = 1, to = 1.12, driftY = 0, children, style }) => {
  const scale = interpolate(progress, [0, 1], [from, to]);
  const y = interpolate(progress, [0, 1], [0, driftY]);
  return (
    <AbsoluteFill
      style={{ transform: `scale(${scale}) translateY(${y}px)`, ...style }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Linear-with-easing dolly value helper for camera moves. */
export const dolly = (
  progress: number,
  from: number,
  to: number,
  easing?: EasingFunction,
): number =>
  interpolate(progress, [0, 1], [from, to], {
    easing: easing ?? EASE_INOUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
