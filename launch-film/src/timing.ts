/**
 * Single source of truth for the film's timing (60fps). Scenes overlap by
 * OVERLAP frames so adjacent scenes cross-dissolve.
 */
export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const OVERLAP = 18;

export const SCENE_STARTS = {
  s1: 0,
  s2: 90,
  s3: 213,
  s4: 311,
  s5: 380,
  s6: 740,
  s7: 1010,
  s8: 1213,
  c1: 1459,
  c3: 1572,
  final: 1654,
} as const;

export const DURATION = 1804; // ~30.1s

export type SceneKey = keyof typeof SCENE_STARTS;

const ORDER: SceneKey[] = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "c1",
  "c3",
  "final",
];

/** Render length for a scene, including the cross-dissolve overlap tail. */
export const lengthFor = (scene: SceneKey): number => {
  const idx = ORDER.indexOf(scene);
  const start = SCENE_STARTS[scene];
  const nextStart =
    idx < ORDER.length - 1 ? SCENE_STARTS[ORDER[idx + 1]] : DURATION;
  const isLast = idx === ORDER.length - 1;
  return nextStart - start + (isLast ? 0 : OVERLAP);
};
