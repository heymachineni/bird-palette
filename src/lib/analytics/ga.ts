/** GA4 measurement ID (Firebase-linked). */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() ?? "";

export const isGaEnabled =
  process.env.NODE_ENV === "production" && GA_MEASUREMENT_ID.length > 0;

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>,
    ) => void;
    dataLayer?: unknown[];
  }
}

export function pageview(url: string) {
  if (!isGaEnabled || typeof window.gtag !== "function") return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}
