import React from "react";

/**
 * A smooth conic spectrum wheel. `rotation` (degrees) and `scale` are driven
 * by the parent so the camera can push in while it spins.
 */
export const ColorWheel: React.FC<{
  size: number;
  rotation: number;
  scale?: number;
  opacity?: number;
  /** 0..1 — collapses the ring toward a thin halo as the HEX locks in. */
  collapse?: number;
}> = ({ size, rotation, scale = 1, opacity = 1, collapse = 0 }) => {
  const innerPct = 38 + collapse * 40; // hole grows as it collapses
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        opacity,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        background:
          "conic-gradient(from 0deg, #FF004D, #FF6A00, #FFD400, #62D200, #00C2A8, #009BFF, #3D3DFF, #9B2DFF, #FF2DAE, #FF004D)",
        WebkitMaskImage: `radial-gradient(circle, transparent ${innerPct}%, #000 ${innerPct + 1}%)`,
        maskImage: `radial-gradient(circle, transparent ${innerPct}%, #000 ${innerPct + 1}%)`,
        filter: "saturate(1.05)",
      }}
    />
  );
};
