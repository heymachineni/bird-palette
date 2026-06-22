import { cn } from "@/lib/utils";

const SKELETON_COUNT = 8;

export function AnimatedEllipsis() {
  return (
    <span className="loading-dots inline-flex" aria-hidden>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );
}

function BirdCardSkeleton() {
  return (
    <div className="rounded-2xl bg-muted/70 p-2" aria-hidden>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted shimmer" />
      <div className="px-1.5 pb-0.5 pt-2.5">
        <div className="h-4 w-[72%] rounded-md bg-muted shimmer" />
        <div className="mt-2 h-3 w-full rounded-full bg-muted shimmer" />
      </div>
    </div>
  );
}

export function HomeLoadingSkeletonGrid({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <BirdCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HomeLoadingMessage({
  query,
  pickedColor,
  mode,
}: {
  query?: string;
  pickedColor?: string | null;
  mode: "search-index" | "browse";
}) {
  const trimmedQuery = query?.trim() ?? "";

  return (
    <p
      className="mb-6 text-center font-serif text-base tracking-tight text-foreground sm:text-lg"
      role="status"
      aria-live="polite"
    >
      {mode === "browse" ? (
        <>
          Gathering the flock
          <AnimatedEllipsis />
        </>
      ) : trimmedQuery && pickedColor ? (
        <>
          Looking for {trimmedQuery} who wears{" "}
          <ColorSwatch hex={pickedColor} />
          <HexLabel hex={pickedColor} />
          <AnimatedEllipsis />
        </>
      ) : trimmedQuery ? (
        <>
          Looking for {trimmedQuery}
          <AnimatedEllipsis />
        </>
      ) : pickedColor ? (
        <>
          Looking for who wears <ColorSwatch hex={pickedColor} />
          <HexLabel hex={pickedColor} />
          <AnimatedEllipsis />
        </>
      ) : (
        <>
          Gathering the flock
          <AnimatedEllipsis />
        </>
      )}
    </p>
  );
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="mx-1 inline-block size-4 translate-y-[2px] rounded-full align-middle ring-1 ring-inset ring-black/10"
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  );
}

function HexLabel({ hex }: { hex: string }) {
  return (
    <span className="font-mono text-[0.9em] uppercase tracking-tight">
      {hex}
    </span>
  );
}
