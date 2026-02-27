import { useCallback, useMemo, useRef, useState } from "react";
import type { ColorFormat, ColorPickerValue, HSVA } from "../types";
import { detectFormat, formatColor, fromHSVA, isValidColor, toHSVA } from "../utils/color";
import { isGradient } from "../utils/css";

interface UseColorPickerOptions {
  value?: ColorPickerValue;
  defaultValue?: ColorPickerValue;
  onValueChange?: (value: ColorPickerValue) => void;
}

/**
 * Core state management hook for the color picker.
 * Maintains internal HSV state for smooth dragging without rounding artifacts.
 */
export function useColorPicker(options: UseColorPickerOptions) {
  const { value: controlledValue, defaultValue = "#000000", onValueChange } = options;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<ColorPickerValue>(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  // Internal HSVA state for smooth drag (avoids hex rounding during drag)
  const initialHSVA = useMemo(() => {
    if (typeof currentValue === "string") {
      return toHSVA(currentValue);
    }
    return { h: 0, s: 0, v: 0, a: 1 };
  }, []); // Only compute once on mount

  const [hsva, setHSVA] = useState<HSVA>(initialHSVA);
  const [format, setFormat] = useState<ColorFormat>(() =>
    typeof currentValue === "string" ? detectFormat(currentValue) : "hex"
  );

  // Sync external controlled value to internal HSVA
  const prevControlledRef = useRef(controlledValue);
  if (controlledValue !== prevControlledRef.current) {
    prevControlledRef.current = controlledValue;
    if (typeof controlledValue === "string") {
      // Only update HSVA if external value changed (not from our own update)
      const newHSVA = toHSVA(controlledValue);
      setHSVA(newHSVA);
    }
  }

  const updateValue = useCallback(
    (newValue: ColorPickerValue) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  const setHue = useCallback(
    (h: number) => {
      setHSVA((prev) => {
        const next = { ...prev, h };
        updateValue(fromHSVA(next));
        return next;
      });
    },
    [updateValue]
  );

  const setSaturationValue = useCallback(
    (s: number, v: number) => {
      setHSVA((prev) => {
        const next = { ...prev, s, v };
        updateValue(fromHSVA(next));
        return next;
      });
    },
    [updateValue]
  );

  const setAlpha = useCallback(
    (a: number) => {
      setHSVA((prev) => {
        const next = { ...prev, a };
        updateValue(fromHSVA(next));
        return next;
      });
    },
    [updateValue]
  );

  const setColorFromString = useCallback(
    (input: string) => {
      if (!isValidColor(input)) return;
      const newHSVA = toHSVA(input);
      setHSVA(newHSVA);
      updateValue(input);
    },
    [updateValue]
  );

  const toggleFormat = useCallback(() => {
    setFormat((prev) => {
      const formats: ColorFormat[] = ["hex", "rgb", "hsl"];
      const idx = formats.indexOf(prev);
      return formats[(idx + 1) % formats.length]!;
    });
  }, []);

  const formattedValue = useMemo(() => {
    const hex = fromHSVA(hsva);
    return formatColor(hex, format);
  }, [hsva, format]);

  const cssValue = useMemo(() => fromHSVA(hsva), [hsva]);

  const isGradientMode = isGradient(currentValue);

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
    setFormat,
    toggleFormat,
    updateValue,
  };
}
