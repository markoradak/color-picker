import { useEffect, useMemo, useState } from "react";
import type { AutoTokensConfig, ColorTokens } from "../types";
import { getCSSColorTokens } from "../utils/color";

/**
 * Merges auto-detected CSS color tokens with manually provided tokens.
 *
 * Auto-detection is deferred to after mount to avoid SSR hydration
 * mismatches (CSS custom properties are only available in the browser).
 *
 * @param autoTokens - Auto-detection config: `true` (detect all), `false` (disabled), or `{ prefix }` to filter.
 * @param manualTokens - Manually provided tokens (override auto-detected on conflict).
 * @returns Merged tokens, or `undefined` if no tokens are available.
 */
export function useAutoTokens(
  autoTokens: AutoTokensConfig | undefined,
  manualTokens?: ColorTokens
): ColorTokens | undefined {
  const prefix =
    autoTokens === false
      ? null // disabled
      : typeof autoTokens === "object"
        ? autoTokens.prefix
        : undefined; // true or undefined → detect all

  // Defer auto-detection to after mount so server and initial client
  // render both produce the same output (no auto-detected tokens).
  const [autoDetected, setAutoDetected] = useState<ColorTokens | undefined>(
    undefined
  );

  useEffect(() => {
    if (prefix === null) {
      setAutoDetected(undefined);
      return;
    }
    setAutoDetected(getCSSColorTokens(prefix));
  }, [prefix]);

  return useMemo(() => {
    const hasAuto = autoDetected && Object.keys(autoDetected).length > 0;
    const hasManual = manualTokens && Object.keys(manualTokens).length > 0;

    if (!hasAuto && !hasManual) return manualTokens; // preserve undefined vs empty
    if (!hasAuto) return manualTokens;
    if (!hasManual) return autoDetected;

    return { ...autoDetected, ...manualTokens };
  }, [autoDetected, manualTokens]);
}
