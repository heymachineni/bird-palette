import React from "react";
import { useCurrentFrame } from "remotion";
import { Typewriter } from "./Typewriter";
import { TYPE_CPS } from "../motion/typing";
import { paper, withAlpha } from "../theme/colors";
import type { type } from "../theme/type";

type Variant = keyof typeof type;

/**
 * Caption pill that only mounts once typing starts and sizes to revealed text.
 */
export const TypewriterCard: React.FC<{
  text: string;
  start: number;
  cps?: number;
  variant?: Variant;
  color?: string;
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({ text, start, cps = TYPE_CPS, variant = "h2", color = paper.ink, maxWidth, style }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;

  return (
    <div
      style={{
        display: "inline-block",
        maxWidth,
        padding: "18px 32px",
        borderRadius: 16,
        background: withAlpha(paper.base, 0.96),
        border: `1px solid ${paper.hairline}`,
        boxShadow: `0 8px 32px ${withAlpha("#000000", 0.1)}`,
        ...style,
      }}
    >
      <Typewriter
        text={text}
        start={start}
        cps={cps}
        variant={variant}
        color={color}
        maxWidth={maxWidth ? maxWidth - 64 : undefined}
        caret={false}
        fitContent
      />
    </div>
  );
};
