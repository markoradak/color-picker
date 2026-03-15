import { forwardRef, useId, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerContrastInfoProps } from "../types";
import { contrastRatio, getWcagLevel } from "../utils/color";
import type { WcagLevel } from "../utils/color";
import { useColorPickerContext } from "./color-picker-context";
import { ColorPickerProvider } from "./color-picker-provider";
import { ColorPickerControls } from "./presets";

const BADGE_LABELS: Record<WcagLevel, string> = {
  AAA: "AAA",
  AA: "AA",
  AA18: "AA18",
  Fail: "Insufficient",
};

/**
 * Displays the WCAG 2.1 contrast ratio between the current picker color
 * and a reference `contrastColor`.
 *
 * Layout: `[split-circle] [ratio]` on the left, `[badge]` on the right.
 *
 * When `onContrastColorChange` is provided, clicking the split-circle
 * opens a popover with a mini color picker to change the reference color.
 */
export const ColorPickerContrastInfo = forwardRef<
  HTMLDivElement,
  ColorPickerContrastInfoProps
>(function ColorPickerContrastInfo(
  { contrastColor, onContrastColorChange, className, classNames, ...rest },
  ref,
) {
  const { cssValue } = useColorPickerContext();
  const clipId = useId();

  const { ratio, level } = useMemo(() => {
    const r = contrastRatio(cssValue, contrastColor);
    return { ratio: r, level: getWcagLevel(r) };
  }, [cssValue, contrastColor]);

  const pass = level !== "Fail";
  const formattedRatio = `${ratio.toFixed(2)} : 1`;

  const interactive = !!onContrastColorChange;

  const indicatorSvg = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <clipPath id={`${clipId}-l`}>
        <rect x="0" y="0" width="8" height="16" />
      </clipPath>
      <clipPath id={`${clipId}-r`}>
        <rect x="8" y="0" width="8" height="16" />
      </clipPath>
      <circle
        cx="8"
        cy="8"
        r="7"
        fill={contrastColor}
        clipPath={`url(#${clipId}-l)`}
      />
      <circle
        cx="8"
        cy="8"
        r="7"
        fill={cssValue}
        clipPath={`url(#${clipId}-r)`}
      />
      <circle
        cx="8"
        cy="8"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.15"
      />
    </svg>
  );

  const indicatorButton = (
    <button
      type="button"
      aria-label={interactive ? "Change contrast color" : "Contrast color indicator"}
      data-cp-el="contrast-indicator"
      className={classNames?.indicator}
      style={{
        cursor: interactive ? "pointer" : "default",
        background: "none",
        border: "none",
        padding: 0,
        lineHeight: 0,
        flexShrink: 0,
      }}
    >
      {indicatorSvg}
    </button>
  );

  return (
    <div
      ref={ref}
      data-cp-part="contrast-info"
      data-pass={pass ? "" : undefined}
      data-level={level.toLowerCase()}
      {...rest}
      className={className}
    >
      {/* Split-circle indicator — popover trigger when interactive */}
      {interactive ? (
        <Popover.Root>
          <Popover.Trigger asChild>
            {indicatorButton}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={6}
              data-cp-part="contrast-picker"
              className="z-50 flex w-64 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <ColorPickerProvider
                value={contrastColor}
                onValueChange={onContrastColorChange}
              >
                <ColorPickerControls
                  enableAlpha={false}
                  enableGradient={false}
                  enableSwatches={false}
                  enableTokenSearch={false}
                />
              </ColorPickerProvider>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ) : (
        indicatorButton
      )}

      {/* Contrast ratio */}
      <span data-cp-el="contrast-ratio" className={classNames?.ratio}>
        {formattedRatio}
      </span>

      {/* Spacer pushes badge to the right */}
      <span style={{ flex: 1 }} />

      {/* WCAG level badge */}
      <span
        data-cp-el="contrast-badge"
        data-pass={pass ? "" : undefined}
        data-level={level.toLowerCase()}
        className={classNames?.badge}
      >
        {pass && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            style={{ display: "inline-block", verticalAlign: "-1px", marginRight: 2 }}
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {BADGE_LABELS[level]}
      </span>
    </div>
  );
});
