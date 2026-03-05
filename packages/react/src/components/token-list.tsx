import type { ColorTokens } from "../types";

/** Props for the shared TokenList component. */
export interface TokenListProps {
  /** Token name-to-color map. */
  tokens: ColorTokens;
  /** Currently matched token name (if any). */
  matchedToken: string | undefined;
  /** Called when the user selects a token. */
  onSelect: (name: string) => void;
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
  };
}

/**
 * Scrollable list of color tokens rendered inside a popover.
 * Each entry shows a small color swatch and the token name.
 * The active token (matching the current color) is highlighted.
 */
export function TokenList({ tokens, matchedToken, onSelect, disabled, className, classNames }: TokenListProps) {
  const entries = Object.entries(tokens);

  if (entries.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Color tokens"
      data-cp-part="token-list"
      className={className}
    >
      {entries.map(([name, color]) => {
        const isActive = name === matchedToken;
        return (
          <button
            key={name}
            type="button"
            role="option"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onSelect(name)}
            data-cp-el="token-item"
            data-active={isActive ? "" : undefined}
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
