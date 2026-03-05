import { useCallback, useEffect, useRef, useState } from "react";
import type { ColorPickerInputProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { isValidColor, resolveToken } from "../utils/color";
import { TokenList } from "./token-list";

/**
 * Text input showing the current color in the selected format (HEX, RGB, HSL).
 * Validates on blur and Enter key, reverting to the last valid value on invalid input.
 * Includes a built-in format toggle button on the left that cycles HEX → RGB → HSL.
 *
 * When tokens are available, a clickable badge opens a dropdown listing all tokens.
 */
export function ColorPickerInput({ className, enableFormatToggle = true }: ColorPickerInputProps) {
  const { formattedValue, format, toggleFormat, setColorFromString, disabled, matchedToken, tokens } =
    useColorPickerContext();

  const [inputValue, setInputValue] = useState(formattedValue);
  const [isEditing, setIsEditing] = useState(false);
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const tokenBadgeRef = useRef<HTMLButtonElement>(null);

  // Sync external value changes when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(formattedValue);
    }
  }, [formattedValue, isEditing]);

  // Click-outside to close token dropdown
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

  const commitValue = useCallback(() => {
    setIsEditing(false);
    const trimmed = inputValue.trim();
    const resolved = resolveToken(trimmed, tokens);
    if (trimmed && isValidColor(resolved)) {
      setColorFromString(trimmed);
    } else {
      // Revert to last valid value
      setInputValue(formattedValue);
    }
  }, [inputValue, formattedValue, setColorFromString]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleKeyDown = useCallback(
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
    [commitValue, formattedValue]
  );

  const handleTokenSelect = useCallback(
    (name: string) => {
      setColorFromString(name);
      setTokenListOpen(false);
    },
    [setColorFromString]
  );

  const handleBadgeClick = useCallback(() => {
    setTokenListOpen((prev) => !prev);
  }, []);

  const formatLabel = format.toUpperCase();
  const hasTokens = tokens && Object.keys(tokens).length > 0;

  return (
    <div
      className={[
        "cp-input",
        "flex items-center gap-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {enableFormatToggle && (
        <button
          type="button"
          onClick={toggleFormat}
          disabled={disabled}
          aria-label={`Color format: ${formatLabel}. Click to change.`}
          className={[
            "cp-format-toggle",
            "shrink-0 select-none rounded-md border px-2 h-8 text-xs font-medium",
            "outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {formatLabel}
        </button>
      )}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          aria-label={`Color value in ${formatLabel} format`}
          className={[
            "cp-input-field",
            "w-full rounded-md border px-2 h-8 text-sm",
            "outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        />
        {hasTokens && (
          <>
            <button
              ref={tokenBadgeRef}
              type="button"
              disabled={disabled}
              onClick={handleBadgeClick}
              aria-label={matchedToken ? `Matches token: ${matchedToken}. Click to browse tokens.` : "Browse color tokens"}
              aria-expanded={tokenListOpen}
              aria-haspopup="listbox"
              className={[
                "cp-token-badge",
                "absolute right-1.5 top-1/2 -translate-y-1/2",
                "select-none rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none",
                "cursor-pointer outline-none",
                "transition-opacity hover:!opacity-100",
                isEditing ? "opacity-40" : "",
              ].filter(Boolean).join(" ")}
            >
              {matchedToken ? (
                matchedToken
              ) : (
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 4l6-2 6 2v3c0 4-3 6.5-6 7.5C5 13.5 2 11 2 7V4z" />
                </svg>
              )}
            </button>
            {tokenListOpen && (
              <div
                ref={tokenDropdownRef}
                className="cp-token-list-popover absolute right-0 top-full z-50 mt-1"
              >
                <TokenList
                  tokens={tokens}
                  matchedToken={matchedToken}
                  onSelect={handleTokenSelect}
                  disabled={disabled}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
