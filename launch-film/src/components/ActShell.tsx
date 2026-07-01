import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { EASE_INOUT } from "../motion/easings";
import { OVERLAP } from "../timing";

/**
 * Wraps an act and applies the cross-dissolve envelope: fade in over the first
 * `fade` frames and out over the last `fade` frames of the act's length.
 */
export const ActShell: React.FC<{
  length: number;
  fade?: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ length, fade = OVERLAP, fadeIn = true, fadeOut = true, children, style }) => {
  const frame = useCurrentFrame();
  const opacityIn = fadeIn
    ? interpolate(frame, [0, fade], [0, 1], {
        easing: EASE_INOUT,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const opacityOut = fadeOut
    ? interpolate(frame, [length - fade, length], [1, 0], {
        easing: EASE_INOUT,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const opacity = opacityIn * opacityOut;
  return <AbsoluteFill style={{ opacity, ...style }}>{children}</AbsoluteFill>;
};
