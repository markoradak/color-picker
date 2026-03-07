import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerInputTriggerProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { fromHSVA, isValidColor, resolveToken } from "../utils/color";
import { toCSS } from "../utils/css";
import { CHECKERBOARD_STYLE } from "./shared";
import { useTokenDropdown } from "../hooks/use-token-dropdown";
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
export const ColorPickerInputTrigger = forwardRef<
  HTMLDivElement,
  ColorPickerInputTriggerProps
>(function ColorPickerInputTrigger({
  className,
  classNames,
  enableFormatToggle = true,
  enableEyeDropper = true,
  enableTokenSearch = true,
  ...rest
}, ref) {
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
  }, [inputValue, formattedValue, setColorFromString, tokens]);

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
  const [showCheck, setShowCheck] = useState(false);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(checkTimerRef.current);
  }, []);

  const handleEyeDropper = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || !isEyeDropperSupported()) return;

      const EyeDropper = (
        window as unknown as { EyeDropper: EyeDropperConstructor }
      ).EyeDropper;

      const dropper = new EyeDropper();
      setIsPicking(true);
      setShowCheck(false);
      clearTimeout(checkTimerRef.current);

      try {
        const result = await dropper.open();
        setColorFromString(result.sRGBHex);
        setIsPicking(false);
        setShowCheck(true);
        checkTimerRef.current = setTimeout(() => setShowCheck(false), 1200);
      } catch {
        // User cancelled
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
  const {
    tokenListOpen,
    tokenSearch,
    tokenDropdownRef,
    tokenBadgeRef,
    tokenSearchInputRef,
    tokenSearchWrapperRef,
    closeTokenDropdown,
    handleTokenSelect,
    handleBadgeClick,
    handleBadgeKeyDown,
    handleSearchChange,
    handleSearchKeyDown,
  } = useTokenDropdown({
    onSelectToken: setColorFromString,
  });

  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  // Position the portal dropdown relative to the badge/search area.
  useLayoutEffect(() => {
    if (!tokenListOpen) return;
    const anchor = tokenSearchWrapperRef.current ?? tokenBadgeRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, [tokenListOpen, tokenSearchWrapperRef, tokenBadgeRef]);

  // Wrap badge click to also stopPropagation (prevent container from opening popover)
  const handleTokenBadgeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleBadgeClick();
    },
    [handleBadgeClick],
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
        ref={ref}
        role="group"
        data-cp-part="input-trigger"
        data-disabled={disabled ? "" : undefined}
        data-cp-anchor=""
        {...rest}
        onClick={(e) => {
          handleContainerClick();
          rest.onClick?.(e);
        }}
        className={className}
      >
        {/* Hidden trigger for Radix -- keeps popover wired for keyboard/a11y */}
        <Popover.Trigger
          disabled={disabled}
          aria-label="Open color picker"
          tabIndex={-1}
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}
        />

        {/* Color thumbnail */}
        <span data-cp-el="thumbnail" className={classNames?.thumbnail} style={{ position: "relative" }} aria-hidden="true">
          <span
            data-cp-el="thumbnail-checkerboard"
            className={classNames?.thumbnailCheckerboard}
            style={{ position: "absolute", inset: 0, ...CHECKERBOARD_STYLE }}
          />
          <span
            data-cp-el="thumbnail-swatch"
            className={classNames?.thumbnailSwatch}
            style={{ position: "absolute", inset: 0, background: displayBackground }}
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
            data-cp-el="format-toggle"
            className={classNames?.formatToggle}
          >
            {formatLabel}
          </button>
        ) : (
          <span data-cp-el="format-label" className={classNames?.formatLabel}>
            {formatLabel}
          </span>
        )}

        {/* Editable color value / display */}
        {isGradientMode ? (
          <span data-cp-el="gradient-display" className={classNames?.gradientDisplay}>
            {toCSS(gradient.gradient)}
          </span>
        ) : (
          <div style={{ position: "relative", minWidth: 0, flex: 1 }}>
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
              data-cp-el="input"
              data-has-tokens={hasTokens && !isEditing ? (matchedToken ? "matched" : "icon") : undefined}
              className={classNames?.input}
              style={{ textOverflow: "ellipsis", overflow: "hidden" }}
            />
            {hasTokens && (
              <>
                {/* Badge -- fades out when searching */}
                <button
                  ref={tokenBadgeRef}
                  type="button"
                  disabled={disabled || (enableTokenSearch && tokenListOpen)}
                  onClick={handleTokenBadgeClick}
                  onKeyDown={handleBadgeKeyDown}
                  tabIndex={enableTokenSearch && tokenListOpen ? -1 : undefined}
                  aria-label={matchedToken ? `Matches token: ${matchedToken}. Click to browse tokens.` : "Browse color tokens"}
                  aria-expanded={tokenListOpen}
                  aria-haspopup="listbox"
                  data-cp-el="token-badge"
                  data-matched={matchedToken ? "" : undefined}
                  data-editing={isEditing ? "" : undefined}
                  className={classNames?.tokenBadge}
                  style={enableTokenSearch && tokenListOpen
                    ? { position: "absolute", opacity: 0, pointerEvents: "none" as const, transform: "scale(0.95)" }
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
                {/* Search input -- fades in when searching */}
                {enableTokenSearch && (
                  <div
                    ref={tokenSearchWrapperRef}
                    data-cp-el="token-search"
                    className={classNames?.tokenSearch}
                    onClick={(e) => e.stopPropagation()}
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
                {tokenListOpen && createPortal(
                  <div
                    ref={tokenDropdownRef}
                    data-cp-token-portal=""
                    className={classNames?.tokenListContainer}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "fixed",
                      top: dropdownPos.top,
                      right: dropdownPos.right,
                      zIndex: "var(--cp-z-index-portal, 99999)",
                    }}
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
            data-cp-el="eye-dropper"
            data-picking={isPicking ? "" : undefined}
            className={classNames?.eyeDropper}
          >
            <span data-cp-el="icon-wrapper" style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {/* Pipette icon */}
              <svg
                data-cp-el="icon"
                className={classNames?.eyeDropperIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  width: "1em", height: "1em",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity: !isPicking && !showCheck ? 1 : 0,
                  transform: !isPicking && !showCheck ? "scale(1)" : "scale(0.5)",
                }}
              >
                <path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" />
                <path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" />
                <path d="m2 22 .414-.414" />
              </svg>
              {/* Spinner */}
              <span
                style={{
                  position: "absolute",
                  display: "inline-flex",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity: isPicking ? 1 : 0,
                  transform: isPicking ? "scale(1)" : "scale(0.5)",
                }}
              >
                <svg
                  data-cp-el="spinner"
                  className={classNames?.eyeDropperSpinner}
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  style={{ width: "1em", height: "1em" }}
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
              </span>
              {/* Checkmark */}
              <svg
                data-cp-el="check"
                className={classNames?.eyeDropperCheck}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: "1em", height: "1em",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity: showCheck ? 1 : 0,
                  transform: showCheck ? "scale(1)" : "scale(0.8)",
                }}
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </Popover.Anchor>
  );
});
