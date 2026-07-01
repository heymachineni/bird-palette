import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SPRING } from "../motion/easings";
import { MUSEUM_SLOTS, type Slot } from "./Collage";
import { paper, withAlpha } from "../theme/colors";

/**
 * Refined, nature-derived palettes for the generic design artifacts. No brand
 * imagery -- these are original mock UI cards, posters, palettes and app
 * screens that show humans constantly building color systems.
 */
const PALETTES: string[][] = [
  ["#1C3A5E", "#4F7CAC", "#A7C4E0", "#E8EEF4"],
  ["#7A2E1D", "#C45A3B", "#E89A6C", "#F3E4D6"],
  ["#244031", "#3E7C59", "#8FBF9F", "#E4EFE6"],
  ["#5A4B8C", "#8E7CC3", "#C3B6E6", "#EEEAF7"],
  ["#8A6D1F", "#D4A93C", "#F0D27A", "#F7EFD8"],
  ["#7A1F3D", "#C24368", "#E892AE", "#F6E1E8"],
];

type Motif = "palette" | "ui" | "poster" | "app";
const MOTIFS: Motif[] = ["poster", "ui", "palette", "app", "poster", "palette", "ui", "app", "poster", "palette", "ui", "app"];

const Tile: React.FC<{ motif: Motif; pal: string[]; w: number; h: number }> = ({
  motif,
  pal,
  w,
  h,
}) => {
  const pad = Math.round(w * 0.08);
  if (motif === "palette") {
    return (
      <div style={{ position: "absolute", inset: 0, background: paper.base, padding: pad, display: "flex", flexDirection: "column", gap: pad * 0.6 }}>
        <div style={{ height: 8, width: "55%", borderRadius: 4, background: paper.hairline }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
          {pal.map((c, i) => (
            <div key={i} style={{ flex: 1, borderRadius: 6, background: c }} />
          ))}
        </div>
      </div>
    );
  }
  if (motif === "ui") {
    return (
      <div style={{ position: "absolute", inset: 0, background: paper.base, padding: pad, display: "flex", flexDirection: "column", gap: pad * 0.55 }}>
        <div style={{ height: w * 0.18, borderRadius: 8, background: pal[1] }} />
        <div style={{ height: 7, width: "80%", borderRadius: 4, background: paper.hairline }} />
        <div style={{ height: 7, width: "65%", borderRadius: 4, background: paper.hairline }} />
        <div style={{ marginTop: "auto", display: "flex", gap: 6 }}>
          <div style={{ height: w * 0.12, flex: 1, borderRadius: 8, background: pal[2] }} />
          <div style={{ height: w * 0.12, width: w * 0.28, borderRadius: 999, background: pal[0] }} />
        </div>
      </div>
    );
  }
  if (motif === "poster") {
    return (
      <div style={{ position: "absolute", inset: 0, background: pal[0], padding: pad, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div style={{ position: "absolute", top: pad, right: pad, width: w * 0.32, height: w * 0.32, borderRadius: "50%", background: pal[2] }} />
        <div style={{ height: 12, width: "70%", borderRadius: 4, background: pal[3], marginBottom: 6 }} />
        <div style={{ height: 8, width: "45%", borderRadius: 4, background: withAlpha(pal[3], 0.7) }} />
      </div>
    );
  }
  // app screen
  return (
    <div style={{ position: "absolute", inset: 0, background: paper.base, padding: pad }}>
      <div style={{ height: 6, width: "40%", borderRadius: 4, background: paper.hairline, margin: "0 auto 8px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {pal.concat(pal).slice(0, 6).map((c, i) => (
          <div key={i} style={{ paddingTop: "70%", borderRadius: 8, background: c }} />
        ))}
      </div>
    </div>
  );
};

/**
 * Human-made color systems collage (Scene 3): generic UI cards, posters,
 * palettes and app screens. Same museum-wall rhythm as the nature collage so
 * the two scenes rhyme: nature came first, we learned from it.
 */
export const DesignTiles: React.FC<{
  slots?: Slot[];
  start: number;
  step?: number;
  aspect?: number;
  cardOpacity?: number;
}> = ({ slots = MUSEUM_SLOTS, start, step = 7, aspect = 1.34, cardOpacity = 0.72 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {slots.map((slot, i) => {
        const delay = start + i * step;
        const s = spring({ frame: frame - delay, fps, config: SPRING.SOFT });
        const drift = Math.sin((frame + i * 40) / 80) * 4;
        const h = slot.w * aspect;
        const pal = PALETTES[i % PALETTES.length];
        const motif = MOTIFS[i % MOTIFS.length];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: slot.w,
              height: h,
              marginLeft: -slot.w / 2,
              marginTop: -h / 2,
              transform: `translateY(${(1 - s) * 22 + drift}px) rotate(${slot.rot}deg) scale(${interpolate(
                s,
                [0, 1],
                [0.94, 1],
              )})`,
              opacity: s * cardOpacity,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: `0 24px 60px ${withAlpha("#000000", 0.16)}`,
              border: `1px solid ${paper.hairline}`,
            }}
          >
            <Tile motif={motif} pal={pal} w={slot.w} h={h} />
          </div>
        );
      })}
    </>
  );
};
