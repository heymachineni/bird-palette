import React from "react";
import { PRODUCT_CONIC } from "./ProductColorWheel";
import { paper, withAlpha } from "../theme/colors";
import { fontFamily } from "../theme/type";

/** Matches product home-search: max-w-sm (384px), h-12, solid fill + border-border. */
export const BAR_W = 384;
export const BAR_H = 48;
export const BAR_BOTTOM = 20;
export const SEARCH_PLACEHOLDER = "Search with any color";
const BORDER = "hsl(32, 14%, 88%)";

export const ProductSearchBar: React.FC<{
  width?: number;
  query?: string;
  caretOpacity?: number;
}> = ({ width = BAR_W, query = "", caretOpacity = 0 }) => {
  const showPlaceholder = query.length === 0;

  return (
    <div
      style={{
        width,
        height: BAR_H,
        display: "flex",
        alignItems: "center",
        borderRadius: 9999,
        border: `1px solid ${BORDER}`,
        backgroundColor: paper.base,
        boxShadow: `0 10px 15px -3px ${withAlpha("#000000", 0.05)}, 0 4px 6px -4px ${withAlpha(
          "#000000",
          0.05,
        )}`,
        paddingLeft: 16,
        paddingRight: 8,
      }}
    >
      <SearchIcon />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          paddingRight: 12,
          fontFamily: fontFamily.sans,
          fontSize: 15,
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        {showPlaceholder ? (
          <span style={{ color: paper.inkFaint }}>{SEARCH_PLACEHOLDER}</span>
        ) : (
          <span style={{ position: "relative", display: "inline-block", color: paper.ink }}>
            {query}
            {caretOpacity > 0 ? (
              <span
                style={{
                  position: "absolute",
                  left: "100%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 2,
                  height: 16,
                  marginLeft: 1,
                  backgroundColor: paper.ink,
                  opacity: caretOpacity,
                }}
              />
            ) : null}
          </span>
        )}
      </div>

      <div style={{ width: 1, height: 24, marginLeft: 6, marginRight: 6, backgroundColor: BORDER }} />

      <div
        style={{
          width: 36,
          height: 36,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundImage: PRODUCT_CONIC,
            boxShadow: `inset 0 0 0 1px ${withAlpha("#000000", 0.1)}`,
          }}
        />
      </div>
    </div>
  );
};

const SearchIcon: React.FC = () => (
  <svg
    width={17}
    height={17}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    style={{ flexShrink: 0, color: paper.inkFaint }}
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <line
      x1="16.5"
      y1="16.5"
      x2="21"
      y2="21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
