import type { ReactNode } from "react";

type PushFn = (content: ReactNode, duration?: number) => void;

let push: PushFn | null = null;

export function bindToast(fn: PushFn | null) {
  push = fn;
}

export function pushToast(content: ReactNode, duration?: number) {
  push?.(content, duration);
}
