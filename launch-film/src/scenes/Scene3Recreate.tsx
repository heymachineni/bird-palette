import React from "react";
import { AbsoluteFill } from "remotion";
import { ActShell } from "../components/ActShell";
import { Collage } from "../components/Collage";
import { Typewriter } from "../components/Typewriter";
import { lengthFor } from "../timing";
import { paper, withAlpha } from "../theme/colors";

/**
 * SCENE 3 - WE HAVE BEEN TRYING TO RECREATE THEM
 * Human color craft in the same museum-wall rhythm as nature: wheels, pigments,
 * swatches, paint, and design color studies — not unrelated consumer products.
 */

const DESIGN_COUNT = 11;

const DESIGN_IMAGES = Array.from(
  { length: DESIGN_COUNT },
  (_, i) => `collage/design/design-${String(i + 1).padStart(2, "0")}.jpg`,
);

export const Scene3Recreate: React.FC = () => {
  const length = lengthFor("s3");

  return (
    <ActShell length={length}>
      <AbsoluteFill style={{ backgroundColor: paper.base }}>
        <Collage images={DESIGN_IMAGES} start={8} step={11} cardOpacity={0.6} />

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
            text="We have been trying to recreate them."
            start={16}
            cps={1}
            variant="h1"
            color={paper.ink}
            maxWidth={1100}
            caret={false}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </ActShell>
  );
};
