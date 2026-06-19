/**
 * Best-effort haptic feedback during user gestures.
 * Android: Vibration API. iOS Safari: hidden switch toggle (no public haptic API).
 */
let iosSwitch: HTMLInputElement | null = null;

function iosSwitchEl(): HTMLInputElement | null {
  if (typeof document === "undefined") return null;
  if (iosSwitch) return iosSwitch;

  iosSwitch = document.createElement("input");
  iosSwitch.type = "checkbox";
  iosSwitch.setAttribute("role", "switch");
  iosSwitch.setAttribute("aria-hidden", "true");
  iosSwitch.tabIndex = -1;
  Object.assign(iosSwitch.style, {
    position: "fixed",
    opacity: "0",
    width: "1px",
    height: "1px",
    top: "0",
    left: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(iosSwitch);
  return iosSwitch;
}

export function paletteHaptic(kind: "tick" | "copy" = "tick") {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(kind === "copy" ? [12] : [6]);
      return;
    }

    const el = iosSwitchEl();
    if (!el) return;
    el.checked = !el.checked;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.checked = !el.checked;
  } catch {
    /* unsupported */
  }
}
