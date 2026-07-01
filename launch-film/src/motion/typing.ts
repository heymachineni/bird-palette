import { OVERLAP } from "../timing";

/** ~1 character per frame for all title typewriter beats. */
export const TYPE_CPS = 1;
/** Standard hold after the last line finishes (~0.75s @ 60fps). */
export const TYPE_HOLD = 45;
/** Longer hold for Scene 8 caption (~1s @ 60fps). */
export const TYPE_HOLD_LONG = 60;

export type TimedLine = { text: string; start: number; end: number };

/** Line 2 starts the frame after line 1 completes. */
export function sequenceLines(texts: string[], start: number, cps = TYPE_CPS): TimedLine[] {
  let cursor = start;
  return texts.map((text) => {
    const lineStart = cursor;
    cursor += text.length / cps;
    return { text, start: lineStart, end: cursor };
  });
}

export function sceneLength(contentEnd: number, hold = TYPE_HOLD): number {
  return contentEnd + hold + OVERLAP;
}
