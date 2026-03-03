import { useCallback, useEffect, useRef, useState } from "react";
import type { ColorPickerInputProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { isValidColor } from "../utils/color";

/**
 * Text input showing the current color in the selected format (HEX, RGB, HSL).
 * Validates on blur and Enter key, reverting to the last valid value on invalid input.
 * Includes a built-in format toggle button on the left that cycles HEX → RGB → HSL.
 */
export function ColorPickerInput({ className, enableFormatToggle = true }: ColorPickerInputProps) {
  const { formattedValue, format, toggleFormat, setColorFromString, disabled } =
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
        "flex items-center overflow-hidden rounded-md border",
        "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {enableFormatToggle && (
        <button
          type="button"
          onClick={toggleFormat}
          disabled={disabled}
          aria-label={`Color format: ${formatLabel}. Click to change.`}
          className={[
            "cp-format-toggle",
            "shrink-0 select-none border-r px-2 py-1 text-xs font-medium",
            "outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {formatLabel}
        </button>
      )}
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
          "w-full px-2 py-1 text-sm",
          "outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      />
    </div>
  );
}
