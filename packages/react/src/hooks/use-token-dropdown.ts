import { useCallback, useEffect, useRef, useState } from "react";

interface UseTokenDropdownOptions {
  /** Callback invoked when a token is selected. */
  onSelectToken: (name: string) => void;
}

interface UseTokenDropdownReturn {
  /** Whether the token dropdown list is open. */
  tokenListOpen: boolean;
  /** Set the open state of the token dropdown. */
  setTokenListOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Current search query text. */
  tokenSearch: string;
  /** Ref for the dropdown container (used for click-outside and keyboard nav). */
  tokenDropdownRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the badge button (used for focus restoration). */
  tokenBadgeRef: React.RefObject<HTMLButtonElement | null>;
  /** Ref for the search input (used for auto-focus). */
  tokenSearchInputRef: React.RefObject<HTMLInputElement | null>;
  /** Ref for the search wrapper element (used for portal positioning). */
  tokenSearchWrapperRef: React.RefObject<HTMLDivElement | null>;
  /** Close the dropdown and reset search, restoring focus to the badge. */
  closeTokenDropdown: () => void;
  /** Handle a token selection from the list. */
  handleTokenSelect: (name: string) => void;
  /** Toggle the dropdown open/closed. */
  handleBadgeClick: () => void;
  /** Open the dropdown on ArrowDown/ArrowUp key press. */
  handleBadgeKeyDown: (e: React.KeyboardEvent) => void;
  /** Update the search query as the user types. */
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handle keyboard navigation within the search input (ArrowDown, Escape, Enter). */
  handleSearchKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Encapsulates the token dropdown state machine shared between
 * `ColorPickerInput` and `ColorPickerInputTrigger`.
 *
 * Manages open/close state, search text, refs, click-outside dismissal,
 * auto-focus on open, and keyboard navigation handlers.
 */
export function useTokenDropdown({
  onSelectToken,
}: UseTokenDropdownOptions): UseTokenDropdownReturn {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");

  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const tokenBadgeRef = useRef<HTMLButtonElement>(null);
  const tokenSearchInputRef = useRef<HTMLInputElement>(null);
  const tokenSearchWrapperRef = useRef<HTMLDivElement>(null);

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

  const closeTokenDropdown = useCallback(() => {
    setTokenListOpen(false);
    setTokenSearch("");
    requestAnimationFrame(() => tokenBadgeRef.current?.focus());
  }, []);

  const handleTokenSelect = useCallback(
    (name: string) => {
      onSelectToken(name);
      closeTokenDropdown();
    },
    [onSelectToken, closeTokenDropdown],
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
        const firstItem = tokenDropdownRef.current?.querySelector(
          '[data-cp-el="token-item"]',
        ) as HTMLElement;
        firstItem?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeTokenDropdown();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const focused = tokenDropdownRef.current?.querySelector(
          '[data-cp-el="token-item"][data-focused]',
        ) as HTMLButtonElement;
        focused?.click();
      }
    },
    [closeTokenDropdown],
  );

  return {
    tokenListOpen,
    setTokenListOpen,
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
  };
}
