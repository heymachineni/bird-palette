import { useCurrentFrame, interpolate, type EasingFunction } from "remotion";
import { EASE_OUT } from "./easings";

/**
 * Normalized 0..1 progress for a timed "beat" relative to the current
 * Sequence. Removes arbitrary magic delays scattered through components.
 *
 * @param start    frame (relative to enclosing Sequence) the beat begins
 * @param duration length of the beat in frames
 * @param easing   easing curve applied to the progress
 */
export const useBeat = (
  start: number,
  duration: number,
  easing: EasingFunction = EASE_OUT,
): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * A symmetric in/hold/out envelope (0 -> 1 -> 1 -> 0) for text beats that
 * appear and then leave. Returns opacity-like progress in 0..1.
 */
export const useEnvelope = (
  inStart: number,
  inDur: number,
  outStart: number,
  outDur: number,
  easing: EasingFunction = EASE_OUT,
): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [inStart, inStart + inDur, outStart, outStart + outDur],
    [0, 1, 1, 0],
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};
