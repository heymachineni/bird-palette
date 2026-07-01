import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { paper } from "../theme/colors";
import { type } from "../theme/type";

type Variant = keyof typeof type;

/**
 * Typewriter text, ~1 character per frame (configurable). A soft caret blinks
 * while typing and fades shortly after the line completes.
 */
export const Typewriter: React.FC<{
  text: string;
  start: number;
  cps?: number;
  variant?: Variant;
  color?: string;
  caret?: boolean;
  align?: "left" | "center";
  maxWidth?: number;
  /** When true, layout follows revealed text instead of reserving the full line. */
  fitContent?: boolean;
  style?: React.CSSProperties;
}> = ({
  text,
  start,
  cps = 1,
  variant = "h1",
  color = paper.ink,
  caret = true,
  align = "center",
  maxWidth,
  fitContent = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - start);
  const revealed = Math.min(text.length, Math.floor(elapsed * cps));
  const done = revealed >= text.length;

  const started = frame >= start;
  const blink = Math.round((Math.sin(frame / 5) + 1) / 2);
  const caretOpacity = started && !done && caret ? blink : 0;

  const visible = text.slice(0, revealed);

  if (fitContent) {
    return (
      <div
        style={{
          ...type[variant],
          color,
          textAlign: align,
          maxWidth,
          display: "inline-block",
          ...style,
        }}
      >
        <span style={{ whiteSpace: "pre-wrap" }}>
          {visible}
          {caret && caretOpacity > 0 ? (
            <span
              style={{
                display: "inline-block",
                width: "0.06em",
                height: "0.92em",
                marginLeft: "0.04em",
                verticalAlign: "baseline",
                backgroundColor: color,
                opacity: caretOpacity,
              }}
            />
          ) : null}
        </span>
      </div>
    );
  }

  const ghost = text;

  return (
    <div
      style={{
        ...type[variant],
        color,
        textAlign: align,
        maxWidth,
        position: "relative",
        display: "inline-block",
        width: maxWidth ? "100%" : undefined,
        ...style,
      }}
    >
      <span style={{ visibility: "hidden", display: "block" }} aria-hidden>
        {ghost}
      </span>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          textAlign: align,
        }}
      >
        <span style={{ position: "relative", display: "inline" }}>
          {visible}
          {caret && caretOpacity > 0 ? (
            <span
              style={{
                display: "inline-block",
                width: "0.06em",
                height: "0.92em",
                marginLeft: "0.04em",
                verticalAlign: "baseline",
                backgroundColor: color,
                opacity: caretOpacity,
              }}
            />
          ) : null}
        </span>
      </span>
    </div>
  );
};
