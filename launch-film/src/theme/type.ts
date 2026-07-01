/**
 * Typography system. Mirrors the product stack:
 *   - Fraunces  -> high-contrast serif headlines
 *   - Inter     -> clean sans supporting text
 *   - JetBrains Mono -> HEX readouts
 * Fonts are loaded via @remotion/google-fonts so they are render-safe.
 */
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const fraunces = loadFraunces("normal", { weights: ["300", "400", "500"] });
const inter = loadInter("normal", { weights: ["400", "500", "600"] });
const mono = loadMono("normal", { weights: ["400", "500"] });

export const fontFamily = {
  serif: fraunces.fontFamily,
  sans: inter.fontFamily,
  mono: mono.fontFamily,
} as const;

export const waitForFonts = () =>
  Promise.all([fraunces.waitUntilDone(), inter.waitUntilDone(), mono.waitUntilDone()]);

/** Reusable text styles. Sizes are tuned for a 1920x1080 stage. */
export const type = {
  display: {
    fontFamily: fontFamily.serif,
    fontWeight: 300,
    fontSize: 124,
    lineHeight: 1.04,
    letterSpacing: "-0.02em",
  },
  h1: {
    fontFamily: fontFamily.serif,
    fontWeight: 300,
    fontSize: 88,
    lineHeight: 1.08,
    letterSpacing: "-0.018em",
  },
  h2: {
    fontFamily: fontFamily.serif,
    fontWeight: 400,
    fontSize: 60,
    lineHeight: 1.12,
    letterSpacing: "-0.012em",
  },
  body: {
    fontFamily: fontFamily.sans,
    fontWeight: 400,
    fontSize: 32,
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontWeight: 500,
    fontSize: 22,
    lineHeight: 1.4,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontWeight: 500,
    fontSize: 52,
    lineHeight: 1,
    letterSpacing: "0.04em",
  },
} as const;
