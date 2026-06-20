"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { bindToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const MAX_STACK = 3;
const EXIT_MS = 300;
const PEEK_PX = 10;
/** Each step back in the stack shrinks noticeably (depth 1 → 92%, depth 2 → 84%). */
const SCALE_STEP = 0.08;

type ToastItem = {
  id: number;
  content: ReactNode;
  exiting: boolean;
};

type ToastContextValue = {
  push: (content: ReactNode, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

/** Single toast shell — one layer, same on every breakpoint. */
export function toastClassName(className?: string) {
  return cn(
    "flex w-max max-w-[min(100vw-2rem,20rem)] items-center gap-2 rounded-full",
    "border border-border bg-background px-3 py-2 text-xs text-foreground shadow-sm",
    className,
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const push = useCallback(
    (content: ReactNode, duration = 2000) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, content, exiting: false }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  useEffect(() => {
    bindToast(push);
    return () => bindToast(null);
  }, [push]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

function stackTransform(depth: number, exiting: boolean) {
  const y = exiting ? 4 - depth * PEEK_PX : -depth * PEEK_PX;
  const scale = exiting ? 0.96 : 1 - depth * SCALE_STEP;
  return `translateX(-50%) translateY(${y}px) scale(${scale})`;
}

function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;

  const stacked = toasts.slice(-MAX_STACK);
  const peekOffset = (stacked.length - 1) * PEEK_PX;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex justify-center px-4"
    >
      <div
        className="relative w-max transition-[padding] duration-300 ease-out"
        style={{ paddingTop: peekOffset, minHeight: 36 }}
      >
        {stacked.map((t, idx) => {
          const depth = stacked.length - 1 - idx;
          const isFront = depth === 0;

          return (
            <div
              key={t.id}
              className={cn(
                "absolute bottom-0 left-1/2 origin-bottom",
                "transition-[transform,opacity] duration-300 ease-out",
                isFront ? "pointer-events-auto" : "pointer-events-none",
              )}
              style={{
                zIndex: MAX_STACK - depth,
                transform: stackTransform(depth, t.exiting),
                opacity: t.exiting ? 0 : 1 - depth * 0.15,
              }}
            >
              <div
                className={cn(
                  toastClassName(),
                  isFront && !t.exiting && "animate-toast-pill-in",
                )}
              >
                {t.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
