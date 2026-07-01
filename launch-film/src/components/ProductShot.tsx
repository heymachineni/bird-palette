import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeImage } from "./SafeImage";
import { paper, withAlpha } from "../theme/colors";

/**
 * Presents a real captured product screenshot full-bleed, with an optional
 * camera transform (scale + translate) for slow, intentional moves.
 */
export const ProductShot: React.FC<{
  src: string;
  scale?: number;
  translateX?: number;
  translateY?: number;
  objectPosition?: string;
  fit?: "cover" | "contain";
  vignette?: boolean;
  fallbackColor?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  scale = 1,
  translateX = 0,
  translateY = 0,
  objectPosition = "center top",
  fit = "cover",
  vignette = false,
  fallbackColor = paper.panel,
  style,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: paper.base, overflow: "hidden", ...style }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        }}
      >
        <SafeImage
          src={src}
          fallbackColor={fallbackColor}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            objectPosition,
          }}
        />
      </AbsoluteFill>
      {vignette ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background: `radial-gradient(120% 90% at 50% 50%, transparent 62%, ${withAlpha(
              "#000000",
              0.16,
            )} 100%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
