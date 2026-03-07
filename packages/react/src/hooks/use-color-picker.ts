import { useCallback, useMemo, useRef, useState } from "react";
import type { AutoTokensConfig, ColorFormat, ColorPickerValue, ColorTokens, HSVA } from "../types";
import { detectFormat, formatColor, fromHSVA, isValidColor, resolveToken, toHSVA } from "../utils/color";
import { isGradient } from "../utils/css";
import { useAutoTokens } from "./use-auto-tokens";

interface UseColorPickerOptions {
  value?: ColorPickerValue;
  defaultValue?: ColorPickerValue;
  onValueChange?: (value: ColorPickerValue) => void;
  tokens?: ColorTokens;
  autoTokens?: AutoTokensConfig;
}

/**
 * Core state management hook for the color picker.
 * Maintains internal HSV state for smooth dragging without rounding artifacts.
 */
export function useColorPicker(options: UseColorPickerOptions) {
  const { value: controlledValue, defaultValue = "#000000", onValueChange, tokens: manualTokens, autoTokens } = options;
  const tokens = useAutoTokens(autoTokens, manualTokens);

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<ColorPickerValue>(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  // Internal HSVA state for smooth drag (avoids hex rounding during drag).
  // Uses a lazy initializer so the initial HSVA is computed once on mount
  // without capturing a stale `tokens` reference from useAutoTokens.
  const [hsva, setHSVA] = useState<HSVA>(() => {
    if (typeof currentValue === "string") {
      return toHSVA(resolveToken(currentValue, tokens ?? {}));
    }
    return { h: 0, s: 0, v: 0, a: 1 };
  });
  const hsvaRef = useRef<HSVA>(hsva);
  const [format, setFormat] = useState<ColorFormat>(() => {
    if (typeof currentValue !== "string") return "hex";
    // Resolve token names first so a token like "rgb-accent" doesn't
    // falsely trigger RGB format detection from the raw name.
    const resolved = resolveToken(currentValue, tokens ?? {});
    return detectFormat(resolved);
  });

  // Track whether the current value change was initiated internally.
  // When we update HSVA via setHue/setSaturationValue/setAlpha, the hex
  // round-trip (HSVA→hex→HSVA) can lose hue information at s=0 or v=0.
  // We skip the controlled-value HSVA sync for our own updates.
  const isInternalUpdateRef = useRef(false);

  // Sync external controlled value to internal HSVA
  const prevControlledRef = useRef(controlledValue);
  if (controlledValue !== prevControlledRef.current) {
    prevControlledRef.current = controlledValue;
    if (isInternalUpdateRef.current) {
      // Skip HSVA sync for our own updates — HSVA is already correct
      isInternalUpdateRef.current = false;
    } else if (typeof controlledValue === "string") {
      const newHSVA = toHSVA(resolveToken(controlledValue, tokens));
      hsvaRef.current = newHSVA;
      setHSVA(newHSVA);
    }
  }

  const updateValue = useCallback(
    (newValue: ColorPickerValue) => {
      isInternalUpdateRef.current = true;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  const setHue = useCallback(
    (h: number): string => {
      const next = { ...hsvaRef.current, h };
      hsvaRef.current = next;
      setHSVA(next);
      const result = fromHSVA(next);
      updateValue(result);
      return result;
    },
    [updateValue]
  );

  const setSaturationValue = useCallback(
    (s: number, v: number): string => {
      const next = { ...hsvaRef.current, s, v };
      hsvaRef.current = next;
      setHSVA(next);
      const result = fromHSVA(next);
      updateValue(result);
      return result;
    },
    [updateValue]
  );

  const setAlpha = useCallback(
    (a: number): string => {
      const next = { ...hsvaRef.current, a };
      hsvaRef.current = next;
      setHSVA(next);
      const result = fromHSVA(next);
      updateValue(result);
      return result;
    },
    [updateValue]
  );

  const setColorFromString = useCallback(
    (input: string) => {
      const resolved = resolveToken(input, tokens);
      if (!isValidColor(resolved)) return;
      const newHSVA = toHSVA(resolved);
      hsvaRef.current = newHSVA;
      setHSVA(newHSVA);
      updateValue(resolved);
    },
    [updateValue, tokens]
  );

  /**
   * Update internal HSVA state without propagating to onValueChange.
   * Used by gradient stop sync to load a stop's color into the picker
   * without overwriting the parent gradient value with a hex string.
   */
  const syncHSVA = useCallback((input: string) => {
    if (!isValidColor(input)) return;
    const newHSVA = toHSVA(input);
    hsvaRef.current = newHSVA;
    setHSVA(newHSVA);
  }, []);

  const toggleFormat = useCallback(() => {
    setFormat((prev) => {
      const formats: ColorFormat[] = ["hex", "rgb", "hsl"];
      const idx = formats.indexOf(prev);
      return formats[(idx + 1) % formats.length]!;
    });
  }, []);

  // Compute cssValue first so formattedValue can reuse it instead of
  // calling fromHSVA a second time (avoids duplicate colord allocation per frame).
  const cssValue = useMemo(() => fromHSVA(hsva), [hsva]);

  const formattedValue = useMemo(
    () => formatColor(cssValue, format),
    [cssValue, format]
  );

  const isGradientMode = isGradient(currentValue);

  // Build a reverse lookup map once when tokens change, normalizing each token
  // color through the same HSVA pipeline the picker uses. This avoids iterating
  // all tokens with HSVA round-trips on every drag frame.
  const tokenReverseMap = useMemo(() => {
    if (!tokens) return null;
    const map: Record<string, string> = {};
    for (const [name, color] of Object.entries(tokens)) {
      map[fromHSVA(toHSVA(color))] = name;
    }
    return map;
  }, [tokens]);

  const matchedToken = useMemo(
    () => (tokenReverseMap ? tokenReverseMap[cssValue] ?? undefined : undefined),
    [cssValue, tokenReverseMap]
  );

  return {
    value: currentValue,
    hsva,
    format,
    formattedValue,
    cssValue,
    isGradientMode,
    setHue,
    setSaturationValue,
    setAlpha,
    setColorFromString,
    syncHSVA,
    setFormat,
    toggleFormat,
    updateValue,
    matchedToken,
    tokens,
  };
}
