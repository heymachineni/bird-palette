"use client";

import { pushToast } from "@/lib/toast";

export function toastCopiedHex(hex: string) {
  pushToast(
    <>
      <span
        className="size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <span className="font-mono uppercase tracking-wide">{hex}</span>
      <span className="text-muted-foreground">Copied</span>
    </>,
    1800,
  );
}

export function toastError(message: string) {
  pushToast(<span>{message}</span>, 2200);
}
