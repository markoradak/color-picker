import { useCallback, useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerInputTriggerProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { fromHSVA, isValidColor } from "../utils/color";
import { toCSS } from "../utils/css";
import { CHECKERBOARD_STYLE } from "./shared";

// Type for the EyeDropper API
interface EyeDropperAPI {
  open: () => Promise<{ sRGBHex: string }>;
}

interface EyeDropperConstructor {
  new (): EyeDropperAPI;
}

function isEyeDropperSupported(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

/**
 * Input-style trigger for the color picker popover.
 *
 * Renders an interactive input field with a color thumbnail, editable text
 * value, format toggle, and eye dropper. Clicking the thumbnail or text area
 * opens the popover while keeping input focus. The format toggle and eye
 * dropper buttons perform their actions without opening the popover.
 */
export function ColorPickerInputTrigger({
  className,
  enableFormatToggle = true,
  enableEyeDropper = true,
}: ColorPickerInputTriggerProps) {
  const {
    hsva,
    formattedValue,
    format,
    toggleFormat,
    setColorFromString,
    disabled,
    isGradientMode,
    gradient,
    setPopoverOpen,
    preserveFocusRef,
  } = useColorPickerContext();

  const currentColor = fromHSVA(hsva);

  const displayBackground = isGradientMode
    ? toCSS(gradient.gradient)
    : currentColor;

  // --- Inline text input state ---
  const [inputValue, setInputValue] = useState(formattedValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(formattedValue);
    }
  }, [formattedValue, isEditing]);

  const commitValue = useCallback(() => {
    setIsEditing(false);
    const trimmed = inputValue.trim();
    if (trimmed && isValidColor(trimmed)) {
      setColorFromString(trimmed);
    } else {
      setInputValue(formattedValue);
    }
  }, [inputValue, formattedValue, setColorFromString]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        commitValue();
        inputRef.current?.blur();
      }
      if (e.key === "Escape") {
        setInputValue(formattedValue);
        setIsEditing(false);
        inputRef.current?.blur();
      }
    },
    [commitValue, formattedValue],
  );

  // Clicking the input opens the popover (without toggling) and keeps focus
  const handleInputClick = useCallback(() => {
    preserveFocusRef.current = true;
    setPopoverOpen(true);
  }, [setPopoverOpen, preserveFocusRef]);

  // --- Eye dropper ---
  const [isPicking, setIsPicking] = useState(false);

  const handleEyeDropper = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || !isEyeDropperSupported()) return;

      const EyeDropper = (
        window as unknown as { EyeDropper: EyeDropperConstructor }
      ).EyeDropper;

      const dropper = new EyeDropper();
      setIsPicking(true);

      try {
        const result = await dropper.open();
        setColorFromString(result.sRGBHex);
      } catch {
        // User cancelled
      } finally {
        setIsPicking(false);
      }
    },
    [setColorFromString, disabled],
  );

  const handleFormatToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFormat();
    },
    [toggleFormat],
  );

  // Clicking the container (thumbnail or empty space) opens the popover
  const handleContainerClick = useCallback(() => {
    if (!disabled) {
      preserveFocusRef.current = true;
      setPopoverOpen(true);
    }
  }, [disabled, setPopoverOpen, preserveFocusRef]);

  const formatLabel = isGradientMode
    ? gradient.gradient.type.toUpperCase()
    : format.toUpperCase();
  const showEyeDropper = enableEyeDropper && isEyeDropperSupported();

  return (
    <Popover.Anchor asChild>
      <div
        role="group"
        data-disabled={disabled ? "" : undefined}
        onClick={handleContainerClick}
        className={[
          "cp-input-trigger",
          "inline-flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border px-1.5",
          "text-left",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Hidden trigger for Radix — keeps popover wired for keyboard/a11y */}
        <Popover.Trigger
          disabled={disabled}
          aria-label="Open color picker"
          tabIndex={-1}
          className="sr-only"
        />

        {/* Color thumbnail */}
        <span className="relative h-7 w-7 shrink-0 rounded-md" aria-hidden="true">
          <span
            className="absolute inset-0 rounded-md"
            style={CHECKERBOARD_STYLE}
          />
          <span
            className="absolute inset-0 rounded-md"
            style={{ background: displayBackground }}
          />
        </span>

        {/* Format label / toggle */}
        {enableFormatToggle && !isGradientMode ? (
          <button
            type="button"
            onClick={handleFormatToggle}
            disabled={disabled}
            tabIndex={-1}
            aria-label={`Color format: ${formatLabel}. Click to change.`}
            className="shrink-0 cursor-pointer select-none rounded px-1 text-xs font-medium opacity-50 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed"
          >
            {formatLabel}
          </button>
        ) : (
          <span className="shrink-0 select-none text-xs font-medium opacity-50">
            {formatLabel}
          </span>
        )}

        {/* Editable color value / display */}
        {isGradientMode ? (
          <span className="min-w-0 flex-1 truncate font-mono text-xs">
            {toCSS(gradient.gradient)}
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            aria-label={`Color value in ${formatLabel} format`}
            className="min-w-0 flex-1 cursor-text bg-transparent font-mono text-xs outline-none disabled:cursor-not-allowed"
          />
        )}

        {/* Eye dropper */}
        {showEyeDropper && !isGradientMode && (
          <button
            type="button"
            onClick={handleEyeDropper}
            disabled={disabled || isPicking}
            tabIndex={-1}
            aria-label="Pick a color from the screen"
            className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-50 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isPicking ? (
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="28"
                  strokeDashoffset="10"
                />
              </svg>
            ) : (
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M13.5 2.5a1.414 1.414 0 0 0-2 0L9.5 4.5l-1-1-5 5V12h3.5l5-5-1-1 2-2a1.414 1.414 0 0 0 0-2Z" />
                <path d="M2 14l2.5-2.5" />
              </svg>
            )}
          </button>
        )}
      </div>
    </Popover.Anchor>
  );
}
