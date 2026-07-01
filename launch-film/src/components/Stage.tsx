import React from "react";
import { AbsoluteFill } from "remotion";
import { stage } from "../theme/colors";

/**
 * The film's base stage: near-black background with a soft radial vignette
 * to focus the eye. An optional ambient tint bleeds in from the edges to echo
 * the on-screen bird's palette.
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  tint?: string;
  tintStrength?: number;
}> = ({ children, tint, tintStrength = 0 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: stage.base }}>
      {tint && tintStrength > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(120% 80% at 50% 50%, ${tint} 0%, transparent 60%)`,
            opacity: tintStrength,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 38%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
