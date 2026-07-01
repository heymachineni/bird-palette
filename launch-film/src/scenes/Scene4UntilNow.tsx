import React from "react";
import { AbsoluteFill } from "remotion";
import { ActShell } from "../components/ActShell";
import { Typewriter } from "../components/Typewriter";
import { lengthFor } from "../timing";
import { paper } from "../theme/colors";

const TYPE_START = 14;

/**
 * SCENE 4 - UNTIL NOW
 * Everything is gone. White. One large centered line. Brief hold, then dissolve.
 */
export const Scene4UntilNow: React.FC = () => {
  const length = lengthFor("s4");

  return (
    <ActShell length={length}>
      <AbsoluteFill
        style={{
          backgroundColor: paper.base,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typewriter
          text="Until now."
          start={TYPE_START}
          cps={1}
          variant="display"
          color={paper.ink}
          style={{ fontSize: 96 }}
          caret={false}
        />
      </AbsoluteFill>
    </ActShell>
  );
};
