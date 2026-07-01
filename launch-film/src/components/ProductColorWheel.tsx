import React from "react";
import { withAlpha } from "../theme/colors";

/**
 * The exact conic color circle used in the product search bar
 * (home-search.tsx). A solid disc with the product's gradient and inset ring,
 * so it scales and rotates crisply for the Scene 7 hero moment.
 */
export const PRODUCT_CONIC =
  "conic-gradient(from 90deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)";

/** #3B82F6 on PRODUCT_CONIC — transform angle (0° = 3 o'clock). */
export const PRODUCT_BLUE_ANGLE = 210;

export const ProductColorWheel: React.FC<{
  size: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  /** Subtle "alive" brightness breathing 0..1. */
  glow?: number;
  /** Picker dot on the wheel rim (angle in degrees, 0 = right). */
  pickerAngle?: number;
  pickerOpacity?: number;
  pickerColor?: string;
}> = ({
  size,
  rotation = 0,
  scale = 1,
  opacity = 1,
  glow = 0,
  pickerAngle,
  pickerOpacity = 0,
  pickerColor = "#3B82F6",
}) => {
  const rim = size * 0.42;
  const dot = Math.max(10, size * 0.13);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        opacity,
        transform: `rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundImage: PRODUCT_CONIC,
          boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.012)}px ${withAlpha(
            "#000000",
            0.1,
          )}, 0 0 ${size * 0.22}px ${withAlpha("#ffffff", 0.18 + glow * 0.22)}`,
        }}
      />
      {pickerAngle !== undefined && pickerOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: dot,
            height: dot,
            borderRadius: "50%",
            border: "2px solid #FFFFFF",
            backgroundColor: pickerColor,
            boxShadow: `0 0 0 1px ${withAlpha("#000000", 0.22)}`,
            opacity: pickerOpacity,
            transform: `rotate(${pickerAngle}deg) translate(${rim}px) translate(-50%, -50%)`,
          }}
        />
      ) : null}
    </div>
  );
};
