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
}

/**
 * Scrollable list of color tokens rendered inside a popover.
 * Each entry shows a small color swatch and the token name.
 * The active token (matching the current color) is highlighted.
 */
export function TokenList({ tokens, matchedToken, onSelect, disabled }: TokenListProps) {
  const entries = Object.entries(tokens);

  if (entries.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Color tokens"
      className="cp-token-list max-h-40 overflow-y-auto rounded-lg border p-1"
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
            className={[
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs",
              "outline-none transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive ? "font-medium" : "",
            ].join(" ")}
            style={{
              backgroundColor: isActive ? "var(--cp-hover-bg)" : undefined,
            }}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full border"
              style={{
                backgroundColor: color,
                borderColor: "var(--cp-border)",
              }}
              aria-hidden="true"
            />
            <span
              className="min-w-0 flex-1 truncate"
              style={{ color: "var(--cp-text)" }}
            >
              {name}
            </span>
            {isActive && (
              <svg
                className="h-3 w-3 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ color: "var(--cp-text-muted)" }}
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
