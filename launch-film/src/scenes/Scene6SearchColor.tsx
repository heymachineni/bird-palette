import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ActShell } from "../components/ActShell";
import { ProductSearchBar, BAR_BOTTOM, BAR_W } from "../components/ProductSearchBar";
import { ProductShot } from "../components/ProductShot";
import { EASE_INOUT } from "../motion/easings";
import { lengthFor } from "../timing";
import { paper, withAlpha } from "../theme/colors";

const SCRIM_H = 192;
const SEARCH_ORIGIN = "50% 87%";
const QUERY = "orange";
const CPS = 1;

// Zoom in → type while zoomed → zoom out to results.
const ZOOM_IN_END = 28;
const TYPE_START = 30;
const TYPE_END = TYPE_START + QUERY.length / CPS;
const HOLD_END = TYPE_END + 48;
const ZOOM_OUT_END = HOLD_END + 44;

/**
 * SCENE 6 - SEARCH BY COLOR
 * Zoom into the search bar, type "orange" one character at a time, then zoom
 * back out to reveal the real filtered results.
 */
export const Scene6SearchColor: React.FC = () => {
  const length = lengthFor("s6");
  const frame = useCurrentFrame();

  const camZoom = interpolate(
    frame,
    [0, ZOOM_IN_END, HOLD_END, ZOOM_OUT_END],
    [1, 2.6, 2.6, 1],
    { easing: EASE_INOUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const elapsed = Math.max(0, frame - TYPE_START);
  const revealed = Math.min(QUERY.length, Math.floor(elapsed * CPS));
  const typed = QUERY.slice(0, revealed);
  const done = revealed >= QUERY.length;
  const doneAtFrame = TYPE_END;

  const started = frame >= TYPE_START;
  const blink = Math.round((Math.sin(frame / 5) + 1) / 2);
  const caretFade = done
    ? interpolate(frame, [doneAtFrame + 8, doneAtFrame + 24], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const caretOpacity = (started ? 1 : 0) * (done ? 1 : blink) * caretFade;

  const searchOpacity = interpolate(frame, [ZOOM_OUT_END - 10, ZOOM_OUT_END + 8], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resultsOpacity = interpolate(frame, [HOLD_END + 4, ZOOM_OUT_END + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ActShell length={length}>
      <AbsoluteFill style={{ backgroundColor: paper.base, overflow: "hidden" }}>
        {/* Search results — revealed as we zoom out */}
        <AbsoluteFill style={{ opacity: resultsOpacity }}>
          <ProductShot src="product/search-orange.png" fit="cover" scale={1} />
        </AbsoluteFill>

        {/* Zoomed search beat: grid + bar + typing */}
        <AbsoluteFill style={{ opacity: searchOpacity }}>
          <AbsoluteFill
            style={{
              transform: `scale(${camZoom})`,
              transformOrigin: SEARCH_ORIGIN,
              overflow: "hidden",
            }}
          >
            <ProductShot src="product/homepage-top.png" fit="cover" scale={1} />
          </AbsoluteFill>

          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: SCRIM_H,
              zIndex: 5,
              pointerEvents: "none",
              background: `linear-gradient(to top, ${paper.base} 0%, ${withAlpha(
                paper.base,
                0.82,
              )} 42%, transparent 100%)`,
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: BAR_BOTTOM,
              transform: `translateX(-50%) scale(${camZoom})`,
              transformOrigin: "50% 100%",
              width: BAR_W,
              zIndex: 10,
            }}
          >
            <ProductSearchBar query={typed} caretOpacity={caretOpacity} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </ActShell>
  );
};
