import { Easing } from "remotion";
import type { SpringConfig } from "remotion";

/**
 * Shared easing curves and spring presets so every motion in the film reads
 * from the same language. EASE_OUT is the primary "calm reveal" curve.
 */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);
export const LINEAR = Easing.linear;

export const SPRING = {
  /** Slow, weighty camera and large objects. */
  GENTLE: { damping: 200, mass: 1, stiffness: 100 } as Partial<SpringConfig>,
  /** UI elements settling in. */
  SOFT: { damping: 30, mass: 0.6, stiffness: 120 } as Partial<SpringConfig>,
  /** Small, lively settles (toasts, dots). */
  SETTLE: { damping: 18, mass: 0.9, stiffness: 140 } as Partial<SpringConfig>,
} as const;
