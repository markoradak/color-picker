import { useMemo } from "react";
import type { AutoTokensConfig, ColorTokens } from "../types";
import { getCSSColorTokens } from "../utils/color";

/**
 * Merges auto-detected CSS color tokens with manually provided tokens.
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

  const autoDetected = useMemo(() => {
    if (prefix === null) return undefined;
    return getCSSColorTokens(prefix);
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
