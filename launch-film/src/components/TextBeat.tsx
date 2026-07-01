import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { EASE_OUT } from "../motion/easings";
import { stage } from "../theme/colors";
import { type } from "../theme/type";

type Variant = keyof typeof type;

/**
 * A single, centered headline beat that fades + rises + de-blurs in, holds,
 * then leaves the same way. The motion language is shared across every act.
 */
export const TextBeat: React.FC<{
  children: React.ReactNode;
  /** Frames (relative to enclosing Sequence). */
  inAt: number;
  inDur?: number;
  outAt: number;
  outDur?: number;
  variant?: Variant;
  color?: string;
  rise?: number;
  blur?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  inAt,
  inDur = 26,
  outAt,
  outDur = 22,
  variant = "h1",
  color = stage.foreground,
  rise = 26,
  blur = 14,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [inAt, inAt + inDur, outAt, outAt + outDur],
    [0, 1, 1, 0],
    { easing: EASE_OUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const enter = interpolate(frame, [inAt, inAt + inDur], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = (1 - enter) * rise;
  const b = (1 - enter) * blur;

  return (
    <div
      style={{
        ...type[variant],
        color,
        opacity,
        transform: `translateY(${y}px)`,
        filter: `blur(${b}px)`,
        textAlign: "center",
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
