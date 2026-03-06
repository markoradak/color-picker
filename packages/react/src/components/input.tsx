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
export function ColorPickerInput({ className, classNames, enableFormatToggle = true }: ColorPickerInputProps) {
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
      tokenBadgeRef.current?.focus();
    },
    [setColorFromString]
  );

  const handleBadgeClick = useCallback(() => {
    setTokenListOpen((prev) => !prev);
  }, []);

  const handleBadgeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setTokenListOpen(true);
      }
    },
    [],
  );

  const handleTokenListClose = useCallback(() => {
    setTokenListOpen(false);
    tokenBadgeRef.current?.focus();
  }, []);

  const formatLabel = format.toUpperCase();
  const hasTokens = tokens && Object.keys(tokens).length > 0;

  return (
    <div
      data-cp-part="input"
      data-disabled={disabled ? "" : undefined}
      className={className}
    >
      {enableFormatToggle && (
        <button
          type="button"
          onClick={toggleFormat}
          disabled={disabled}
          aria-label={`Color format: ${formatLabel}. Click to change.`}
          data-cp-el="format-toggle"
          className={classNames?.formatToggle}
        >
          {formatLabel}
        </button>
      )}
      <div style={{ position: "relative", width: "100%" }}>
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
          data-cp-el="field"
          className={classNames?.field}
        />
        {hasTokens && (
          <>
            <button
              ref={tokenBadgeRef}
              type="button"
              disabled={disabled}
              onClick={handleBadgeClick}
              onKeyDown={handleBadgeKeyDown}
              aria-label={matchedToken ? `Matches token: ${matchedToken}. Click to browse tokens.` : "Browse color tokens"}
              aria-expanded={tokenListOpen}
              aria-haspopup="listbox"
              data-cp-el="token-badge"
              data-matched={matchedToken ? "" : undefined}
              data-editing={isEditing && !matchedToken ? "" : undefined}
              className={classNames?.tokenBadge}
              style={{ position: "absolute" }}
            >
              {matchedToken ? (
                matchedToken
              ) : (
                <svg
                  data-cp-el="token-icon"
                  className={classNames?.tokenIcon}
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
            {tokenListOpen && (
              <div
                ref={tokenDropdownRef}
                data-cp-el="token-list-popover"
                className={classNames?.tokenListContainer}
                style={{ position: "absolute", right: 0, top: "100%", zIndex: 50, marginTop: 4 }}
              >
                <TokenList
                  tokens={tokens!}
                  matchedToken={matchedToken}
                  onSelect={handleTokenSelect}
                  onClose={handleTokenListClose}
                  disabled={disabled}
                  className={classNames?.tokenList}
                  classNames={{
                    item: classNames?.tokenListItem,
                    swatch: classNames?.tokenListSwatch,
                    name: classNames?.tokenListName,
                    check: classNames?.tokenListCheck,
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
