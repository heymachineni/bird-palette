import React from "react";
import { useCurrentFrame } from "remotion";
import { Typewriter } from "./Typewriter";
import { sequenceLines, TYPE_CPS } from "../motion/typing";
import { paper } from "../theme/colors";
import type { type } from "../theme/type";

type Variant = keyof typeof type;

/**
 * Title card copy: line 1 types fully, then line 2. Each line only mounts once
 * its typing window begins.
 */
export const TypewriterLines: React.FC<{
  lines: string[];
  start: number;
  cps?: number;
  variant?: Variant;
  color?: string;
  gap?: number;
  align?: "left" | "center";
  maxWidth?: number;
}> = ({
  lines,
  start,
  cps = TYPE_CPS,
  variant = "h2",
  color = paper.ink,
  gap = 16,
  align = "center",
  maxWidth,
}) => {
  const frame = useCurrentFrame();
  const timed = sequenceLines(lines, start, cps);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap }}>
      {timed.map((line) =>
        frame >= line.start ? (
          <Typewriter
            key={line.text}
            text={line.text}
            start={line.start}
            cps={cps}
            variant={variant}
            color={color}
            align={align}
            maxWidth={maxWidth}
            caret={false}
            fitContent
          />
        ) : null,
      )}
    </div>
  );
};
