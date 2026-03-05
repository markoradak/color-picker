import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerInputTriggerProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { fromHSVA, isValidColor, resolveToken } from "../utils/color";
import { toCSS } from "../utils/css";
import { CHECKERBOARD_STYLE } from "./shared";
import { TokenList } from "./token-list";

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

const emptySubscribe = () => () => {};

function useIsEyeDropperSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => isEyeDropperSupported(),
    () => false,
  );
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
    matchedToken,
    tokens,
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
    const resolved = resolveToken(trimmed, tokens);
    if (trimmed && isValidColor(resolved)) {
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

  // --- Token dropdown ---
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const tokenBadgeRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  // Position the portal dropdown relative to the badge.
  useLayoutEffect(() => {
    if (!tokenListOpen || !tokenBadgeRef.current) return;
    const rect = tokenBadgeRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, [tokenListOpen]);

  // Click-outside to close token dropdown.
  useEffect(() => {
    if (!tokenListOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        tokenDropdownRef.current?.contains(target) ||
        tokenBadgeRef.current?.contains(target)
      ) {
        return;
      }
      setTokenListOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [tokenListOpen]);

  const handleTokenSelect = useCallback(
    (name: string) => {
      setColorFromString(name);
      setTokenListOpen(false);
    },
    [setColorFromString]
  );

  const handleTokenBadgeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setTokenListOpen((prev) => !prev);
    },
    []
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
  const eyeDropperSupported = useIsEyeDropperSupported();
  const showEyeDropper = enableEyeDropper && eyeDropperSupported;
  const hasTokens = tokens && Object.keys(tokens).length > 0;

  return (
    <Popover.Anchor asChild>
      <div
        role="group"
        data-disabled={disabled ? "" : undefined}
        data-cp-anchor=""
        onClick={handleContainerClick}
        className={[
          "cp-input-trigger",
          "inline-flex h-10 w-full cursor-pointer items-center gap-1.5 rounded-lg border px-1.5",
          "text-left",
          "",
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
            className="shrink-0 cursor-pointer select-none rounded px-1 text-xs font-medium opacity-50 outline-none hover:opacity-80 disabled:cursor-not-allowed"
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
          <div className="relative min-w-0 flex-1">
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
              className="w-full cursor-text bg-transparent font-mono text-xs outline-none disabled:cursor-not-allowed"
            />
            {hasTokens && (
              <>
                <button
                  ref={tokenBadgeRef}
                  type="button"
                  disabled={disabled}
                  onClick={handleTokenBadgeClick}
                  aria-label={matchedToken ? `Matches token: ${matchedToken}. Click to browse tokens.` : "Browse color tokens"}
                  aria-expanded={tokenListOpen}
                  aria-haspopup="listbox"
                  className={[
                    matchedToken ? "cp-token-badge" : "",
                    "absolute right-1.5 top-1/2 -translate-y-1/2",
                    "cursor-pointer outline-none",
                    matchedToken
                      ? "select-none rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none"
                      : "opacity-50 hover:opacity-80",
                    matchedToken ? "" : "transition-opacity hover:opacity-100!",
                    isEditing ? "opacity-40" : matchedToken ? "" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {matchedToken ? (
                    matchedToken
                  ) : (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z" />
                      <path d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7" />
                      <path d="M 7 17h.01" />
                      <path d="m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8" />
                    </svg>
                  )}
                </button>
                {tokenListOpen && createPortal(
                  <div
                    ref={tokenDropdownRef}
                    data-cp-token-portal=""
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "fixed",
                      top: dropdownPos.top,
                      right: dropdownPos.right,
                      zIndex: 99999,
                    }}
                  >
                    <TokenList
                      tokens={tokens!}
                      matchedToken={matchedToken}
                      onSelect={handleTokenSelect}
                      disabled={disabled}
                    />
                  </div>,
                  document.body,
                )}
              </>
            )}
          </div>
        )}

        {/* Eye dropper */}
        {showEyeDropper && !isGradientMode && (
          <button
            type="button"
            onClick={handleEyeDropper}
            disabled={disabled || isPicking}
            tabIndex={-1}
            aria-label="Pick a color from the screen"
            className={[
              "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-50 outline-none hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30",
              matchedToken ? "-ml-1.5" : "-ml-1",
            ].join(" ")}
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
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" />
                <path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" />
                <path d="m2 22 .414-.414" />
              </svg>
            )}
          </button>
        )}
      </div>
    </Popover.Anchor>
  );
}
