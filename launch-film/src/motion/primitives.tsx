import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  type EasingFunction,
} from "remotion";
import { EASE_OUT, SPRING } from "./easings";

type Common = {
  /** Delay in frames relative to the enclosing Sequence. */
  delay?: number;
  /** Duration of the entrance in frames. */
  duration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/** Opacity fade-in. */
export const FadeIn: React.FC<Common & { easing?: EasingFunction }> = ({
  delay = 0,
  duration = 30,
  easing = EASE_OUT,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ opacity, ...style }}>{children}</div>;
};

/** Rise + fade: translate up into place while fading in. */
export const RiseIn: React.FC<Common & { distance?: number; easing?: EasingFunction }> = ({
  delay = 0,
  duration = 36,
  distance = 40,
  easing = EASE_OUT,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Blur + fade: resolve out of softness. */
export const BlurIn: React.FC<Common & { blur?: number; easing?: EasingFunction }> = ({
  delay = 0,
  duration = 48,
  blur = 24,
  easing = EASE_OUT,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: p,
        filter: `blur(${(1 - p) * blur}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Scale-in using a spring for a natural settle. */
export const ScaleIn: React.FC<
  Common & { from?: number; springConfig?: typeof SPRING.SOFT }
> = ({ delay = 0, from = 0.92, springConfig = SPRING.SOFT, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: springConfig });
  const scale = interpolate(s, [0, 1], [from, 1]);
  return (
    <div style={{ opacity: s, transform: `scale(${scale})`, ...style }}>
      {children}
    </div>
  );
};

/** Vertical wipe reveal using a clip. */
export const MaskReveal: React.FC<Common & { easing?: EasingFunction }> = ({
  delay = 0,
  duration = 48,
  easing = EASE_OUT,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + duration], [0, 100], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ clipPath: `inset(0 0 ${100 - p}% 0)`, ...style }}>
      {children}
    </div>
  );
};

/**
 * Stagger: clones children and applies an incremental delay to each. Children
 * are expected to accept a `delay` prop (the primitives above all do).
 */
export const Stagger: React.FC<{
  baseDelay?: number;
  step?: number;
  children: React.ReactNode;
}> = ({ baseDelay = 0, step = 4, children }) => {
  return (
    <>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        const element = child as React.ReactElement<{ delay?: number }>;
        return React.cloneElement(element, {
          delay: baseDelay + i * step + (element.props.delay ?? 0),
        });
      })}
    </>
  );
};
