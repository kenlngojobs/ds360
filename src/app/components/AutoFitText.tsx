import React, { useRef, useState, useEffect, useCallback } from "react";

/**
 * AutoFitText — shrinks font size so text fits inside its container width.
 *
 * • mode="line"  (headers)    → measures full text as a single line; scales to fit one line.
 * • mode="word"  (paragraphs) → measures the longest word; scales so no single word overflows.
 *
 * Falls back to `baseFontSize` when the container is wide enough.
 * Never goes below `minFontSize`.
 */
export function AutoFitText({
  as: Tag = "div",
  text,
  baseFontSize,
  minFontSize = 10,
  fontFamily,
  fontWeight,
  mode = "line",
  style,
  className,
}: {
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: string;
  baseFontSize: number;
  minFontSize?: number;
  fontFamily: string;
  fontWeight: number;
  mode?: "line" | "word";
  style?: React.CSSProperties;
  className?: string;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [scaledSize, setScaledSize] = useState(baseFontSize);

  // Measure text off-screen at baseFontSize and compare to container width
  const computeFit = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Available width = the parent's content width (the wrapper that constrains us)
    const availableWidth = el.offsetWidth;
    if (availableWidth <= 0) {
      setScaledSize(baseFontSize);
      return;
    }

    // What text to measure
    const sample =
      mode === "word"
        ? text
            .split(/\s+/)
            .reduce((longest, w) => (w.length > longest.length ? w : longest), "")
        : text;

    if (!sample) {
      setScaledSize(baseFontSize);
      return;
    }

    // Create off-screen measurer
    const span = document.createElement("span");
    span.style.cssText = `
      position:absolute; visibility:hidden; white-space:nowrap; pointer-events:none;
      font-size:${baseFontSize}px; font-family:${fontFamily}; font-weight:${fontWeight};
    `;
    span.textContent = sample;
    document.body.appendChild(span);
    const textWidth = span.getBoundingClientRect().width;
    document.body.removeChild(span);

    if (textWidth > availableWidth) {
      const ratio = availableWidth / textWidth;
      // Use floor and a tiny safety margin to prevent sub-pixel wrapping
      const fitted = Math.max(minFontSize, Math.floor(baseFontSize * ratio * 0.98));
      setScaledSize(fitted);
    } else {
      setScaledSize(baseFontSize);
    }
  }, [baseFontSize, text, fontFamily, fontWeight, mode, minFontSize]);

  // Re-compute when inputs change
  useEffect(() => {
    computeFit();
  }, [computeFit]);

  // Re-compute when the container resizes (e.g. column width change, zoom)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => computeFit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeFit]);

  return (
    <Tag
      ref={containerRef as React.Ref<any>}
      className={className}
      style={{ ...style, fontSize: `${scaledSize}px` }}
    >
      {text}
    </Tag>
  );
}
