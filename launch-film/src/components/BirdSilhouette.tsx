import React from "react";

/**
 * A minimal, elegant soaring-bird silhouette used in Act 1 and as a fallback.
 * Pure shape so it reads cleanly against black.
 */
export const BirdSilhouette: React.FC<{
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ size = 420, color = "#F4F1EC", style }) => {
  return (
    <svg
      width={size}
      height={size * 0.42}
      viewBox="0 0 240 100"
      fill="none"
      style={style}
    >
      <path
        d="M6 70 C 58 18 92 16 112 52 C 118 62 122 62 128 52 C 148 16 182 18 234 70 C 182 44 150 50 130 74 C 124 82 116 82 110 74 C 90 50 58 44 6 70 Z"
        fill={color}
      />
    </svg>
  );
};
