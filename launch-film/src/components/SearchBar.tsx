import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { stage, withAlpha } from "../theme/colors";
import { fontFamily } from "../theme/type";

/**
 * Minimal search field with a typewriter query and blinking caret.
 * `typedChars` controls how much of `query` is visible (drive from frame).
 */
export const SearchBar: React.FC<{
  query: string;
  typedChars: number;
  width?: number;
  accent?: string;
  placeholder?: string;
}> = ({ query, typedChars, width = 760, accent = stage.foreground, placeholder = "Search by color" }) => {
  const frame = useCurrentFrame();
  const visible = query.slice(0, Math.max(0, Math.floor(typedChars)));
  const caretOpacity = Math.round((Math.sin(frame / 6) + 1) / 2);
  const showPlaceholder = visible.length === 0;

  return (
    <div
      style={{
        width,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "26px 34px",
        borderRadius: 999,
        backgroundColor: stage.panelSoft,
        border: `1px solid ${stage.hairline}`,
        boxShadow: `0 30px 80px ${withAlpha("#000000", 0.45)}`,
      }}
    >
      <SearchIcon color={withAlpha(stage.foreground, 0.55)} />
      <div
        style={{
          fontFamily: fontFamily.sans,
          fontWeight: 500,
          fontSize: 38,
          letterSpacing: "0.01em",
          color: showPlaceholder ? withAlpha(stage.foreground, 0.32) : accent,
          display: "flex",
          alignItems: "center",
        }}
      >
        {showPlaceholder ? placeholder : visible}
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: 40,
            marginLeft: 6,
            backgroundColor: accent,
            opacity: showPlaceholder ? 0 : caretOpacity,
          }}
        />
      </div>
    </div>
  );
};

const SearchIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
