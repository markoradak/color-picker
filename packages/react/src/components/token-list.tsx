import { useCallback, useEffect, useRef, useState } from "react";
import type { ColorTokens } from "../types";

/** Props for the shared TokenList component. */
export interface TokenListProps {
  /** Token name-to-color map. */
  tokens: ColorTokens;
  /** Currently matched token name (if any). */
  matchedToken: string | undefined;
  /** Called when the user selects a token. */
  onSelect: (name: string) => void;
  /** Called when the user presses Escape to close the list. */
  onClose?: () => void;
  /** Search string to filter tokens by name. */
  search?: string;
  /** Whether interactions are disabled. */
  disabled: boolean;
  /** Additional CSS class for the container. */
  className?: string;
  /** Class names for inner elements. */
  classNames?: {
    item?: string;
    swatch?: string;
    name?: string;
    check?: string;
    empty?: string;
  };
}

/**
 * Scrollable list of color tokens rendered inside a popover.
 * Each entry shows a small color swatch and the token name.
 * The active token (matching the current color) is highlighted.
 *
 * Supports full keyboard navigation: Arrow Up/Down to move between items,
 * Home/End to jump to first/last, Escape to close.
 */
export function TokenList({ tokens, matchedToken, onSelect, onClose, search, disabled, className, classNames }: TokenListProps) {
  const allEntries = Object.entries(tokens);
  const entries = search
    ? allEntries.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    : allEntries;
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mountedRef = useRef(false);

  // Compute initial focused index (matched token or first item)
  const getInitialIndex = () => {
    if (entries.length === 0) return -1;
    const matchedIndex = matchedToken
      ? entries.findIndex(([name]) => name === matchedToken)
      : -1;
    return matchedIndex >= 0 ? matchedIndex : 0;
  };

  const [focusedIndex, setFocusedIndex] = useState(getInitialIndex);

  // Reset focused index when search filter changes (skip initial mount)
  useEffect(() => {
    if (!mountedRef.current) return;
    setFocusedIndex(entries.length > 0 ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Focus + scroll the item into view on mount (only when no search input above)
  useEffect(() => {
    mountedRef.current = true;
    if (search === undefined && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
      itemRefs.current[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
    // Only run on mount — component remounts each time dropdown opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    itemRefs.current[index]?.focus();
    itemRefs.current[index]?.scrollIntoView({ block: "nearest" });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = focusedIndex < entries.length - 1 ? focusedIndex + 1 : 0;
          moveFocus(next);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = focusedIndex > 0 ? focusedIndex - 1 : entries.length - 1;
          moveFocus(prev);
          break;
        }
        case "Home": {
          e.preventDefault();
          moveFocus(0);
          break;
        }
        case "End": {
          e.preventDefault();
          moveFocus(entries.length - 1);
          break;
        }
        case "Escape": {
          e.preventDefault();
          onClose?.();
          break;
        }
      }
    },
    [entries.length, focusedIndex, moveFocus, onClose],
  );

  if (entries.length === 0) {
    if (search) {
      return (
        <div data-cp-part="token-list" className={className}>
          <span data-cp-el="token-empty" className={classNames?.empty}>
            No matches
          </span>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      role="listbox"
      aria-label="Color tokens"
      data-cp-part="token-list"
      className={className}
      onKeyDown={handleKeyDown}
    >
      {entries.map(([name, color], index) => {
        const isActive = name === matchedToken;
        const isFocused = index === focusedIndex;
        return (
          <button
            key={name}
            ref={(el) => { itemRefs.current[index] = el; }}
            type="button"
            role="option"
            aria-selected={isActive}
            disabled={disabled}
            tabIndex={isFocused ? 0 : -1}
            onClick={() => onSelect(name)}
            onPointerEnter={() => setFocusedIndex(index)}
            data-cp-el="token-item"
            data-active={isActive ? "" : undefined}
            data-focused={isFocused ? "" : undefined}
            className={classNames?.item}
          >
            <span
              data-cp-el="token-swatch"
              className={classNames?.swatch}
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span data-cp-el="token-name" className={classNames?.name}>
              {name}
            </span>
            {isActive && (
              <svg
                data-cp-el="token-check"
                className={classNames?.check}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
