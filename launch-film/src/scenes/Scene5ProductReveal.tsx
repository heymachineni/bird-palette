import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { ActShell } from "../components/ActShell";
import { ProductSearchBar, BAR_BOTTOM } from "../components/ProductSearchBar";
import { SafeImage } from "../components/SafeImage";
import { EASE_INOUT } from "../motion/easings";
import { lengthFor } from "../timing";
import { paper, withAlpha } from "../theme/colors";

const SCROLL_TO = 1500;
const SCRIM_H = 192;

/**
 * SCENE 5 - PRODUCT REVEAL
 * Scroll the homepage grid down to the search area. Zoom happens in Scene 6.
 */
export const Scene5ProductReveal: React.FC = () => {
  const length = lengthFor("s5");
  const frame = useCurrentFrame();

  const scrollY = interpolate(frame, [0, length], [0, -SCROLL_TO], {
    easing: EASE_INOUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ActShell length={length}>
      <AbsoluteFill style={{ backgroundColor: paper.base, overflow: "hidden" }}>
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <SafeImage
            src="product/homepage-tall.png"
            fallbackColor={paper.panel}
            style={{ width: 1920, height: "auto", transform: `translateY(${scrollY}px)` }}
          />
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
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <ProductSearchBar />
        </div>
      </AbsoluteFill>
    </ActShell>
  );
};
