import React, { useEffect, useState } from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile, interpolate, delayRender, continueRender } from "remotion";
import { DURATION, SCENE_STARTS } from "../timing";

/**
 * Each cue probes its file once; if missing, nothing renders (no error), so the
 * film still previews end-to-end if an audio asset is ever absent.
 */
const SafeAudio: React.FC<{
  src: string;
  volume?: number | ((frame: number) => number);
  loop?: boolean;
}> = ({ src, volume = 1, loop = false }) => {
  const [exists, setExists] = useState<boolean | null>(null);
  const [handle] = useState(() => delayRender(`probe-${src}`));

  useEffect(() => {
    let active = true;
    fetch(staticFile(src), { method: "HEAD" })
      .then((r) => active && setExists(r.ok))
      .catch(() => active && setExists(false))
      .finally(() => continueRender(handle));
    return () => {
      active = false;
    };
  }, [handle, src]);

  if (!exists) return null;
  return <Audio src={staticFile(src)} volume={volume} loop={loop} />;
};

const fade = (frame: number, points: number[], values: number[]): number =>
  interpolate(frame, points, values, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Absolute typing windows (scene start + relative Typewriter start), char counts.
const TYPED_LINES: { start: number; chars: number }[] = [
  { start: SCENE_STARTS.s2 + 16, chars: 62 },
  { start: SCENE_STARTS.s3 + 16, chars: 37 },
  { start: SCENE_STARTS.s4 + 14, chars: 10 },
  { start: SCENE_STARTS.s6 + 12, chars: 6 },
  { start: SCENE_STARTS.s7 + 336, chars: 22 },
  { start: SCENE_STARTS.s7 + 380, chars: 48 },
  { start: SCENE_STARTS.c1 + 16, chars: 33 },
  { start: SCENE_STARTS.c2 + 16, chars: 16 },
  { start: SCENE_STARTS.c3 + 16, chars: 21 },
];

const CLICK_STEP = 4; // a soft tick every few characters (understated)
const CLICK_VOL = 0.16;

const TypeClicks: React.FC = () => {
  const clicks: number[] = [];
  for (const line of TYPED_LINES) {
    for (let f = 0; f < line.chars; f += CLICK_STEP) {
      clicks.push(line.start + f);
    }
  }
  return (
    <>
      {clicks.map((from, i) => (
        <Sequence key={i} from={from} durationInFrames={6} layout="none">
          <SafeAudio src="audio/type-click.wav" volume={CLICK_VOL} />
        </Sequence>
      ))}
    </>
  );
};

/** Calm, minimal soundtrack: a warm pad bed + understated typewriter clicks. */
export const Soundtrack: React.FC = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={DURATION} layout="none">
        <SafeAudio
          src="audio/atmosphere-pad.wav"
          loop
          volume={(f) => fade(f, [0, 150, DURATION - 150, DURATION], [0, 0.3, 0.3, 0])}
        />
      </Sequence>
      <TypeClicks />
    </>
  );
};
