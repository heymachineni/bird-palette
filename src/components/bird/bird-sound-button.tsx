"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBirdSound } from "@/lib/bird-sound/fetch-bird-sound";
import type { BirdSoundState } from "@/lib/bird-sound/types";
import { pushToast } from "@/lib/toast";
import { paletteHaptic } from "@/lib/haptics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const UNAVAILABLE_COPY = "Very shy bird, no chirps recorded yet.";
const UNAVAILABLE_TOAST_MS = 2200;

function AudioWaveIcon({
  playing,
  className,
}: {
  playing: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={cn(
        "size-[18px]",
        playing && "bird-sound-waves--playing",
        className,
      )}
      aria-hidden
    >
      <rect
        x="3.5"
        y="7"
        width="2"
        height="6"
        rx="1"
        className="bird-sound-wave fill-current"
      />
      <rect
        x="9"
        y="4.5"
        width="2"
        height="11"
        rx="1"
        className="bird-sound-wave bird-sound-wave--2 fill-current"
      />
      <rect
        x="14.5"
        y="6"
        width="2"
        height="8"
        rx="1"
        className="bird-sound-wave bird-sound-wave--3 fill-current"
      />
    </svg>
  );
}

export function BirdSoundButton({
  scientificName,
  className,
}: {
  scientificName: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<BirdSoundState>({ status: "idle" });
  const [playing, setPlaying] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    setPlaying(false);
    audioRef.current?.pause();

    void fetchBirdSound(scientificName)
      .then((payload) => {
        if (cancelled) return;
        if (!payload.available) {
          setState({ status: "unavailable" });
          return;
        }
        setState({ status: "ready", sound: payload });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
      audioRef.current?.pause();
      setPlaying(false);
    };
  }, [scientificName]);

  const togglePlay = useCallback(() => {
    if (state.status !== "ready") return;

    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    if (coarsePointer) paletteHaptic("tick");

    void audio.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }, [coarsePointer, playing, state]);

  const onAudioEnded = useCallback(() => setPlaying(false), []);

  const showUnavailableToast = useCallback(() => {
    if (coarsePointer) paletteHaptic("tick");
    pushToast(<span>{UNAVAILABLE_COPY}</span>, UNAVAILABLE_TOAST_MS);
  }, [coarsePointer]);

  const loading = state.status === "loading" || state.status === "idle";
  const unavailable =
    state.status === "unavailable" || state.status === "error";
  const ready = state.status === "ready";

  const button = (
    <button
      type="button"
      aria-label={
        ready
          ? playing
            ? `Pause ${state.sound.soundType}`
            : `Play ${state.sound.soundType}`
          : "Bird sound unavailable"
      }
      disabled={!ready && !(unavailable && coarsePointer)}
      onClick={
        unavailable && coarsePointer ? showUnavailableToast : togglePlay
      }
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/70 transition-[color,transform,background-color] duration-300 ease-out",
        ready &&
          "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95",
        playing && "text-foreground",
        unavailable &&
          (coarsePointer
            ? "cursor-pointer text-muted-foreground/40 active:scale-95"
            : "cursor-default text-muted-foreground/40"),
        loading && "cursor-default text-muted-foreground/35",
        className,
      )}
    >
      <AudioWaveIcon playing={playing && ready} />
    </button>
  );

  return (
    <>
      {unavailable && !coarsePointer ? (
        <TooltipProvider delayDuration={250}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">{button}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="z-[100]">
              {UNAVAILABLE_COPY}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}

      {ready ? (
        <audio
          ref={audioRef}
          src={state.sound.audioUrl}
          preload="none"
          onEnded={onAudioEnded}
          className="hidden"
        />
      ) : null}
    </>
  );
}
