import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ActShell } from "../components/ActShell";
import { SafeImage } from "../components/SafeImage";
import { EASE_OUT } from "../motion/easings";
import { lengthFor } from "../timing";

/**
 * SCENE 1 - OPENING
 * Bird Palette grid artwork. Brief hold (1.5s) with a very subtle push-in.
 */
export const Scene1Opening: React.FC = () => {
  const length = lengthFor("s1");
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, length], [1.0, 1.04], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ActShell length={length} fadeIn={false}>
      <SafeImage
        src="opening-grid.png"
        fallbackColor="#FBFAF7"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      />
    </ActShell>
  );
};
