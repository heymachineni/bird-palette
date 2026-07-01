import React from "react";
import { AbsoluteFill } from "remotion";
import { ActShell } from "../components/ActShell";
import { Collage } from "../components/Collage";
import { Typewriter } from "../components/Typewriter";
import { lengthFor } from "../timing";
import { paper, withAlpha } from "../theme/colors";

const NATURE_IMAGES = Array.from(
  { length: 16 },
  (_, i) => `collage/nature/nature-${String(i + 1).padStart(2, "0")}.jpg`,
);

/**
 * SCENE 2 - NATURE CREATED THEM
 * White museum wall. A typewriter line over an elegant collage of vintage
 * natural-history illustrations building around the canvas edges.
 */
export const Scene2NatureCreated: React.FC = () => {
  const length = lengthFor("s2");

  return (
    <ActShell length={length}>
      <AbsoluteFill style={{ backgroundColor: paper.base }}>
        <Collage images={NATURE_IMAGES} start={8} step={11} cardOpacity={0.6} />

        {/* Soft center scrim so the headline stays readable. */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(58% 46% at 50% 50%, ${paper.base} 0%, ${withAlpha(
              paper.base,
              0.86,
            )} 55%, ${withAlpha(paper.base, 0)} 100%)`,
          }}
        />

        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 200 }}>
          <Typewriter
            text="Nature has been creating color palettes for millions of years."
            start={16}
            cps={1}
            variant="h1"
            color={paper.ink}
            maxWidth={1180}
            caret={false}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </ActShell>
  );
};
