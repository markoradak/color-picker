import { useCallback, useEffect, useRef, useState } from "react";
import type { ColorPickerInputProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { isValidColor } from "../utils/color";

/**
 * Text input showing the current color in the selected format (HEX, RGB, HSL).
 * Validates on blur and Enter key, reverting to the last valid value on invalid input.
 * Displays an inline format label.
 */
export function ColorPickerInput({ className }: ColorPickerInputProps) {
  const { formattedValue, format, setColorFromString, disabled } =
    useColorPickerContext();

  const [inputValue, setInputValue] = useState(formattedValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(formattedValue);
    }
  }, [formattedValue, isEditing]);

  const commitValue = useCallback(() => {
    setIsEditing(false);
    const trimmed = inputValue.trim();
    if (trimmed && isValidColor(trimmed)) {
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

  const formatLabel = format.toUpperCase();

  return (
    <div
      className={[
        "cp-input",
        "flex items-center gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="shrink-0 select-none text-xs font-medium text-neutral-500">
        {formatLabel}
      </span>
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
        className={[
          "w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm",
          "outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      />
    </div>
  );
}
