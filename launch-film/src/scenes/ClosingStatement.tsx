import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ActShell } from "../components/ActShell";
import { ProductShot } from "../components/ProductShot";
import { Typewriter } from "../components/Typewriter";
import { TYPE_CPS } from "../motion/typing";
import { lengthFor } from "../timing";
import { paper, withAlpha } from "../theme/colors";

type Line = {
  text: string;
  variant?: "display" | "h1" | "h2";
  maxWidth?: number;
  start?: number;
  caret?: boolean;
};

/**
 * Closing statement with optional faded product UI behind the type.
 */
export const ClosingStatement: React.FC<{
  text?: string;
  lines?: Line[];
  sceneKey: SceneKey;
  variant?: "display" | "h1" | "h2";
  maxWidth?: number;
  /** Pause after typing finishes (seconds). */
  holdAfterTyping?: number;
  /** Faded product screenshot behind the text. */
  backgroundSrc?: string;
}> = ({
  text,
  lines,
  sceneKey,
  variant = "h1",
  maxWidth = 1200,
  holdAfterTyping = 0.75,
  backgroundSrc,
}) => {
  const frame = useCurrentFrame();
  const length = lengthFor(sceneKey);
  const resolved: Line[] = lines ?? (text ? [{ text, variant, maxWidth }] : []);
  const typeStart = 16;
  const cps = TYPE_CPS;
  const holdFrames = Math.round(holdAfterTyping * 60);

  let cursor = typeStart;
  const timed = resolved.map((line) => {
    const start = line.start ?? cursor;
    cursor = start + line.text.length / cps;
    return { ...line, start, caret: false };
  });

  void (cursor + holdFrames);

  return (
    <ActShell length={length}>
      <AbsoluteFill style={{ backgroundColor: paper.base }}>
        {backgroundSrc ? (
          <>
            <AbsoluteFill style={{ opacity: 0.09, overflow: "hidden" }}>
              <ProductShot src={backgroundSrc} fit="cover" scale={1.02} objectPosition="50% 20%" />
            </AbsoluteFill>
            <AbsoluteFill
              style={{
                background: `radial-gradient(70% 58% at 50% 50%, ${paper.base} 0%, ${withAlpha(
                  paper.base,
                  0.92,
                )} 52%, ${withAlpha(paper.base, 0.78)} 100%)`,
              }}
            />
          </>
        ) : null}

        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 200,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {timed.map((line) =>
              frame >= line.start ? (
                <Typewriter
                  key={line.text}
                  text={line.text}
                  start={line.start}
                  cps={cps}
                  variant={line.variant ?? variant}
                  color={paper.ink}
                  maxWidth={line.maxWidth ?? maxWidth}
                  caret={line.caret}
                  fitContent
                />
              ) : null,
            )}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </ActShell>
  );
};
