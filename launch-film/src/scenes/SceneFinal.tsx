import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ActShell } from "../components/ActShell";
import { Typewriter } from "../components/Typewriter";
import { EASE_OUT } from "../motion/easings";
import { lengthFor } from "../timing";
import { paper } from "../theme/colors";

/**
 * FINAL LOGO
 * Clean white. The Bird Palette wordmark types in, then holds.
 */
export const SceneFinal: React.FC = () => {
  const length = lengthFor("final");
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [6, 52], [0.94, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ActShell length={length} fadeOut>
      <AbsoluteFill
        style={{ backgroundColor: paper.base, alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ transform: `scale(${scale})` }}>
          <Typewriter
            text="Bird Palette"
            start={16}
            cps={1}
            variant="display"
            color={paper.ink}
            caret={false}
            style={{ fontSize: 110, fontWeight: 500 }}
          />
        </div>
      </AbsoluteFill>
    </ActShell>
  );
};
