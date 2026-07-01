import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ActShell } from "../components/ActShell";
import {
  ProductColorWheel,
  PRODUCT_BLUE_ANGLE,
  PRODUCT_CONIC,
} from "../components/ProductColorWheel";
import { ProductShot } from "../components/ProductShot";
import { TypewriterLines } from "../components/TypewriterLines";
import { EASE_OUT, EASE_INOUT, LINEAR } from "../motion/easings";
import { lengthFor } from "../timing";
import { paper, withAlpha } from "../theme/colors";
import { type } from "../theme/type";

const SEL = "#3B82F6";

const BAR_W = 384;
const BAR_H = BAR_W * (144 / 816);
const BAR_BOTTOM = 20;
const BAR_LEFT = 960 - BAR_W / 2;
const WHEEL_X = BAR_LEFT + 0.913 * BAR_W;
const WHEEL_Y = 1080 - BAR_BOTTOM - BAR_H / 2;
const WHEEL_D = BAR_H * 0.39;

const HERO_X = 960;
const HERO_Y = 380;
const HERO_WHEEL = 300;

/** Lift ~0.55s with a full spin so rotation reads clearly. */
const LIFT_START = 10;
const LIFT_END = 44;
const PICK_START = 52;
const TEXT_START = 82;

/**
 * SCENE 7 - COLOR WHEEL MOMENT
 * No search-bar zoom. Wheel emerges at 18s, rotates while rising, bg fades out.
 */
export const Scene7ColorWheel: React.FC = () => {
  const length = lengthFor("s7");
  const frame = useCurrentFrame();

  const bgOpacity = interpolate(frame, [LIFT_START, LIFT_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const liftT = interpolate(frame, [LIFT_START, LIFT_END], [0, 1], {
    easing: EASE_INOUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wheelX = interpolate(liftT, [0, 1], [WHEEL_X, HERO_X]);
  const wheelY = interpolate(liftT, [0, 1], [WHEEL_Y, HERO_Y]);
  const wheelSize = interpolate(liftT, [0, 1], [WHEEL_D, HERO_WHEEL]);

  const wheelAppear = interpolate(frame, [LIFT_START, LIFT_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rotation = interpolate(frame, [LIFT_START, LIFT_END], [0, 360], {
    easing: LINEAR,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glow = interpolate(frame, [LIFT_START + 8, LIFT_END - 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pickerOpacity = interpolate(frame, [PICK_START, PICK_START + 18], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hexOpacity = interpolate(frame, [PICK_START + 10, PICK_START + 28], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ActShell length={length}>
      <AbsoluteFill style={{ backgroundColor: paper.base, overflow: "hidden" }}>
        <AbsoluteFill style={{ opacity: bgOpacity }}>
          <ProductShot src="product/search-orange.png" fit="cover" scale={1} objectPosition="50% 100%" />
        </AbsoluteFill>

        <div
          style={{
            position: "absolute",
            left: wheelX,
            top: wheelY,
            width: wheelSize * 1.55,
            height: wheelSize * 1.55,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            borderRadius: "50%",
            backgroundImage: PRODUCT_CONIC,
            filter: "blur(52px)",
            opacity: 0.3 * glow * wheelAppear,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: wheelX,
            top: wheelY,
            transform: "translate(-50%, -50%)",
            opacity: wheelAppear,
            zIndex: 10,
          }}
        >
          <ProductColorWheel
            size={wheelSize}
            rotation={rotation}
            glow={glow}
            pickerAngle={PRODUCT_BLUE_ANGLE}
            pickerOpacity={pickerOpacity}
            pickerColor={SEL}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: wheelX,
            top: wheelY - wheelSize / 2 - 32,
            transform: "translate(-50%, -100%)",
            opacity: hexOpacity,
            zIndex: 15,
            ...type.mono,
            fontSize: 14,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: paper.ink,
          }}
        >
          {SEL}
        </div>

        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: HERO_Y + HERO_WHEEL / 2 + 44,
            zIndex: 25,
          }}
        >
          <TypewriterLines
            lines={[
              "Search with any color code.",
              "For your next project. Or your next inspiration.",
            ]}
            start={TEXT_START}
            variant="h2"
            color={paper.ink}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </ActShell>
  );
};
