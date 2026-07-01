import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ActShell } from "../components/ActShell";
import { ProductShot } from "../components/ProductShot";
import { SafeImage } from "../components/SafeImage";
import { TypewriterCard } from "../components/TypewriterCard";
import { EASE_OUT, SPRING } from "../motion/easings";
import { lengthFor } from "../timing";
import { paper, withAlpha } from "../theme/colors";
import { fontFamily } from "../theme/type";
import { BIRD_SAMPLES } from "../data/bird-samples";

const CAPTION = "Select color codes directly from the bird image";
const CAPTION_START = 140;

function sampleAt(frame: number) {
  const pts = BIRD_SAMPLES;
  if (frame <= pts[0].f) return pts[0];
  if (frame >= pts[pts.length - 1].f) return pts[pts.length - 1];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const t = (frame - a.f) / (b.f - a.f);
      return {
        f: frame,
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        hex: t < 0.5 ? a.hex : b.hex,
      };
    }
  }
  return pts[pts.length - 1];
}

/**
 * SCENE 8 - BIRD DETAILS
 * Crosshair samples hex values; caption on a light pill at the top.
 */
export const Scene8BirdDetails: React.FC = () => {
  const length = lengthFor("s8");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const push = interpolate(frame, [0, length], [1.0, 1.06], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sample = sampleAt(
    interpolate(frame, [40, 150], [40, 150], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const crossIn = spring({ frame: frame - 40, fps, config: SPRING.GENTLE });

  const toastIn = spring({ frame: frame - 100, fps, config: SPRING.SETTLE });
  const toastOut = interpolate(frame, [132, 140], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const toastOpacity = toastIn * toastOut;
  const copiedHex = BIRD_SAMPLES[BIRD_SAMPLES.length - 1].hex;

  return (
    <ActShell length={length}>
      <AbsoluteFill style={{ backgroundColor: paper.base }}>
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          <SafeImage
            src="product/bird-detail.png"
            fallbackColor={paper.panel}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />

          <div
            style={{
              position: "absolute",
              left: sample.x,
              top: sample.y,
              transform: `translate(-50%, -50%) scale(${crossIn})`,
              opacity: crossIn,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid #fff",
                boxShadow: `0 0 0 1px ${withAlpha("#000", 0.2)}`,
                backgroundColor: sample.hex,
                margin: "0 auto",
              }}
            />
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 8px",
                height: 24,
                borderRadius: 999,
                border: `1px solid ${paper.hairline}`,
                background: withAlpha(paper.base, 0.95),
                boxShadow: `0 4px 14px ${withAlpha("#000", 0.1)}`,
                fontFamily: fontFamily.mono,
                fontSize: 10,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: paper.ink,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: sample.hex,
                  border: `1px solid ${withAlpha("#000", 0.1)}`,
                  flexShrink: 0,
                }}
              />
              {sample.hex}
            </div>
          </div>
        </AbsoluteFill>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 16,
            transform: `translate(-50%, ${(1 - toastIn) * 8}px)`,
            opacity: toastOpacity,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            border: `1px solid ${paper.hairline}`,
            background: paper.base,
            boxShadow: `0 1px 4px ${withAlpha("#000", 0.08)}`,
            fontSize: 12,
            color: paper.ink,
            zIndex: 20,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: copiedHex,
              border: `1px solid ${withAlpha("#000", 0.1)}`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: fontFamily.mono, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {copiedHex}
          </span>
          <span style={{ fontFamily: fontFamily.sans, color: paper.inkSoft }}>Copied</span>
        </div>

        {/* Caption — grows with typewriter; 1s hold then dissolve via timing.ts */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 56,
            transform: "translateX(-50%)",
            zIndex: 25,
            textAlign: "center",
          }}
        >
          <TypewriterCard
            text={CAPTION}
            start={CAPTION_START}
            variant="h2"
            color={paper.ink}
            maxWidth={920}
          />
        </div>
      </AbsoluteFill>
    </ActShell>
  );
};
