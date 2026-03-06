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
 * The badge transforms into a search input when the dropdown is open.
 */
export function ColorPickerInput({ className, classNames, enableFormatToggle = true, enableTokenSearch = true }: ColorPickerInputProps) {
  const { formattedValue, format, toggleFormat, setColorFromString, disabled, matchedToken, tokens } =
    useColorPickerContext();

  const [inputValue, setInputValue] = useState(formattedValue);
  const [isEditing, setIsEditing] = useState(false);
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const tokenBadgeRef = useRef<HTMLButtonElement>(null);
  const tokenSearchInputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(formattedValue);
    }
  }, [formattedValue, isEditing]);

  // Auto-focus the search input when dropdown opens
  useEffect(() => {
    if (tokenListOpen) {
      tokenSearchInputRef.current?.focus();
    }
  }, [tokenListOpen]);

  // Click-outside to close token dropdown
  useEffect(() => {
    if (!tokenListOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        tokenDropdownRef.current?.contains(target) ||
        (target as Element).closest?.('[data-cp-el="token-search"]') ||
        tokenBadgeRef.current?.contains(target)
      ) {
        return;
      }
      setTokenListOpen(false);
      setTokenSearch("");
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

  const closeTokenDropdown = useCallback(() => {
    setTokenListOpen(false);
    setTokenSearch("");
    requestAnimationFrame(() => tokenBadgeRef.current?.focus());
  }, []);

  const handleTokenSelect = useCallback(
    (name: string) => {
      setColorFromString(name);
      closeTokenDropdown();
    },
    [setColorFromString, closeTokenDropdown]
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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTokenSearch(e.target.value);
    },
    [],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const firstItem = tokenDropdownRef.current?.querySelector('[data-cp-el="token-item"]') as HTMLElement;
        firstItem?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeTokenDropdown();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const focused = tokenDropdownRef.current?.querySelector('[data-cp-el="token-item"][data-focused]') as HTMLButtonElement;
        focused?.click();
      }
    },
    [closeTokenDropdown],
  );

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
            {/* Badge — fades out when searching */}
            <button
              ref={tokenBadgeRef}
              type="button"
              disabled={disabled || (enableTokenSearch && tokenListOpen)}
              onClick={handleBadgeClick}
              onKeyDown={handleBadgeKeyDown}
              tabIndex={enableTokenSearch && tokenListOpen ? -1 : undefined}
              aria-label={matchedToken ? `Matches token: ${matchedToken}. Click to browse tokens.` : "Browse color tokens"}
              aria-expanded={tokenListOpen}
              aria-haspopup="listbox"
              data-cp-el="token-badge"
              data-matched={matchedToken ? "" : undefined}
              data-editing={isEditing && !matchedToken ? "" : undefined}
              className={classNames?.tokenBadge}
              style={enableTokenSearch && tokenListOpen
                ? { position: "absolute", opacity: 0, pointerEvents: "none", transform: "scale(0.95)" }
                : { position: "absolute" }}
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
            {/* Search input — fades in when searching */}
            {enableTokenSearch && (
              <div
                data-cp-el="token-search"
                className={classNames?.tokenSearch}
                style={!tokenListOpen
                  ? { position: "absolute", opacity: 0, pointerEvents: "none" as const, transform: "scale(0.95)" }
                  : { position: "absolute" }}
              >
                <input
                  ref={tokenSearchInputRef}
                  type="text"
                  value={tokenSearch}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  tabIndex={!tokenListOpen ? -1 : undefined}
                  placeholder="Search..."
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Search color tokens"
                  data-cp-el="token-search-input"
                  className={classNames?.tokenSearchInput}
                />
                <svg
                  data-cp-el="token-search-icon"
                  className={classNames?.tokenSearchIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            )}
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
                  search={enableTokenSearch ? tokenSearch : undefined}
                  onSelect={handleTokenSelect}
                  onClose={closeTokenDropdown}
                  disabled={disabled}
                  className={classNames?.tokenList}
                  classNames={{
                    item: classNames?.tokenListItem,
                    swatch: classNames?.tokenListSwatch,
                    name: classNames?.tokenListName,
                    check: classNames?.tokenListCheck,
                    empty: classNames?.tokenListEmpty,
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
