"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { isBirdNetImageUrl } from "@/lib/photos/birdnet-placeholder";
import { fetchInaturalistPhoto } from "@/lib/photos/inaturalist";
import { hasBirdImage } from "@/lib/photos/placeholder";
import { photoProxyUrl } from "@/lib/photos/sample-url";

type BirdPhotoVariant = "hero" | "card" | "mini" | "plate";

const VARIANTS: Record<
  BirdPhotoVariant,
  { wrapper: string; img: string; sizes: string }
> = {
  hero: {
    wrapper:
      "relative w-full overflow-hidden rounded-2xl ring-1 ring-inset ring-border/50 " +
      "h-[min(36vw,200px)] sm:h-[min(42vw,260px)] md:h-[min(38vw,320px)] " +
      "lg:h-auto lg:aspect-[4/3] lg:max-h-[440px]",
    img: "object-cover object-center",
    sizes: "(max-width: 1024px) 100vw, 480px",
  },
  card: {
    wrapper: "relative aspect-[4/3] w-full overflow-hidden",
    img: "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105",
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  },
  mini: {
    wrapper:
      "relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-inset ring-border/50",
    img: "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105",
    sizes: "(max-width: 640px) 50vw, 25vw",
  },
  plate: {
    wrapper: "relative w-full overflow-hidden",
    img: "object-cover object-center",
    sizes: "(max-width: 1024px) 100vw, 560px",
  },
};

function photoDisplayCandidates(remoteSrc: string): string[] {
  const proxied = photoProxyUrl(remoteSrc);
  if (proxied !== remoteSrc) return [proxied, remoteSrc];
  return [remoteSrc];
}

function buildPhotoCandidates(
  primary: string,
  inatFallback: string | null,
): string[] {
  const urls: string[] = [];
  for (const remote of [primary, inatFallback]) {
    if (!remote) continue;
    for (const candidate of photoDisplayCandidates(remote)) {
      if (!urls.includes(candidate)) urls.push(candidate);
    }
  }
  return urls;
}

export function BirdPhoto({
  src,
  alt,
  variant,
  priority = false,
  scientificName,
  commonName,
  className,
}: {
  src: string;
  alt: string;
  variant: BirdPhotoVariant;
  priority?: boolean;
  scientificName?: string;
  commonName?: string;
  className?: string;
}) {
  const v = VARIANTS[variant];
  const [inatFallback, setInatFallback] = useState<string | null>(null);
  const [inatPending, setInatPending] = useState(false);
  const [tryIndex, setTryIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [awaitingFallback, setAwaitingFallback] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const candidates = useMemo(
    () => buildPhotoCandidates(src, inatFallback),
    [src, inatFallback],
  );
  const displaySrc = candidates[tryIndex] ?? src;
  const reserveImageArea =
    hasBirdImage(src) || inatPending || !!inatFallback || awaitingFallback;

  useEffect(() => {
    setInatFallback(null);
    setInatPending(false);
    setTryIndex(0);
    setLoaded(false);
    setFailed(false);
    setAwaitingFallback(false);
  }, [src]);

  useEffect(() => {
    if (!scientificName || !isBirdNetImageUrl(src)) return;

    let cancelled = false;
    setInatPending(true);
    void fetchInaturalistPhoto(scientificName, commonName)
      .then((inat) => {
        if (!cancelled && inat) setInatFallback(inat);
      })
      .finally(() => {
        if (!cancelled) setInatPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [src, scientificName, commonName]);

  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, [displaySrc]);

  useEffect(() => {
    if (!awaitingFallback) return;

    if (inatFallback) {
      setAwaitingFallback(false);
      setFailed(false);
      setLoaded(false);
      setTryIndex(buildPhotoCandidates(src, null).length);
      return;
    }

    if (!inatPending) {
      setAwaitingFallback(false);
      setFailed(true);
    }
  }, [awaitingFallback, inatFallback, inatPending, src]);

  const onImageError = useCallback(() => {
    setLoaded(false);
    setTryIndex((index) => {
      const next = index + 1;
      if (next < candidates.length) return next;

      if (inatPending) {
        setAwaitingFallback(true);
      } else {
        setFailed(true);
      }
      return index;
    });
  }, [candidates.length, inatPending]);

  if (!reserveImageArea) return null;

  return (
    <div className={cn(v.wrapper, className)}>
      {!loaded && !failed && (
        <div aria-hidden className="absolute inset-0 bg-muted shimmer" />
      )}
      {failed && (
        <div
          aria-hidden
          className="absolute inset-0 bg-muted/80"
        />
      )}
      {!failed && (
        /* Native img — Next/Image can keep stale pixels when src changes on the same node. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={displaySrc}
          ref={imgRef}
          src={displaySrc}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          className={cn(
            v.img,
            "absolute inset-0 h-full w-full transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
          onError={onImageError}
        />
      )}
    </div>
  );
}
