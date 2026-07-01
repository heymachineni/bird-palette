import React, { useState } from "react";
import { staticFile, AbsoluteFill, Img } from "remotion";
import { withAlpha } from "../theme/colors";

/**
 * Renders an image from public/ via staticFile. If the file is missing, it
 * gracefully falls back to a soft color field so the film still previews
 * end-to-end before real assets are supplied.
 */
export const SafeImage: React.FC<{
  src: string;
  fallbackColor?: string;
  alt?: string;
  style?: React.CSSProperties;
}> = ({ src, fallbackColor = "#222", alt = "", style }) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 70% at 50% 45%, ${withAlpha(
            fallbackColor,
            0.85,
          )} 0%, ${withAlpha(fallbackColor, 0.15)} 70%, transparent 100%)`,
          ...style,
        }}
      />
    );
  }

  return (
    <Img
      src={staticFile(src)}
      alt={alt}
      onError={() => setErrored(true)}
      style={{ display: "block", ...style }}
    />
  );
};
