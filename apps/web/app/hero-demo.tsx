"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaGradient,
  ColorPickerAreaThumb,
  ColorPickerHueSlider,
  ColorPickerHueSliderTrack,
  ColorPickerHueSliderThumb,
  ColorPickerAlphaSlider,
  ColorPickerAlphaSliderTrack,
  ColorPickerAlphaSliderThumb,
  ColorPickerInput,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerSwatch,
  ColorPickerModeSelector,
  ColorPickerModeSelectorItem,
  ColorPickerGradientEditor,
  ColorPickerGradientSwatches,
  ColorPickerGradientSwatch,
  ColorPickerInputTrigger,
  ColorPickerContent,
  ColorPickerContrastInfo,
  ColorPickerContrastLine,
} from "@markoradak/color-picker";
import type { ColorPickerValue } from "@markoradak/color-picker";
import { styles } from "./component-styles";

const DEFAULT_SWATCH_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function HeroDemo() {
  const { theme } = useTheme();
  const [value, setValue] = useState<ColorPickerValue>("#16db89");
  const [contrastColor, setContrastColor] = useState("#ffffff");

  useEffect(() => {
    setContrastColor(theme === "dark" ? "#000000" : "#ffffff");
  }, [theme]);

  const isGradientMode = typeof value !== "string";

  return (
    <ColorPicker value={value} onValueChange={setValue} defaultOpen>
      <div className="w-72">
        <ColorPickerInputTrigger
          className={styles.inputTrigger}
          classNames={styles.inputTriggerClassNames}
        />
      </div>
      <ColorPickerContent className={styles.content} style={{ width: "var(--radix-popper-anchor-width)" }}>
        <ColorPickerModeSelector className={styles.modeSelector}>
          {(["solid", "linear", "radial", "conic", "mesh"] as const).map((mode) => (
            <ColorPickerModeSelectorItem
              key={mode}
              value={mode}
              className={styles.modeSelectorItem}
            />
          ))}
        </ColorPickerModeSelector>
        {isGradientMode ? (
          <>
            <ColorPickerGradientEditor
              className={styles.gradientEditor}
              classNames={styles.gradientEditorClassNames}
            />
            <ColorPickerGradientSwatches className={styles.gradientSwatches} swatchClassName={styles.gradientSwatch} />
          </>
        ) : (
          <>
            <ColorPickerContrastInfo
              contrastColor={contrastColor}
              onContrastColorChange={setContrastColor}
              className="flex items-center gap-1.5 text-xs"
              classNames={{
                ratio: "font-mono font-medium tabular-nums text-neutral-700 dark:text-neutral-300",
                badge: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none",
              }}
            />
            <ColorPickerArea className={styles.area}>
              <ColorPickerAreaGradient className={styles.areaGradient} />
              <ColorPickerContrastLine contrastColor={contrastColor} />
              <ColorPickerAreaThumb className={styles.areaThumb} />
            </ColorPickerArea>
            <ColorPickerHueSlider className={styles.hueSlider}>
              <ColorPickerHueSliderTrack className={styles.hueSliderTrack} />
              <ColorPickerHueSliderThumb className={styles.hueSliderThumb} />
            </ColorPickerHueSlider>
            <ColorPickerAlphaSlider className={styles.alphaSlider}>
              <ColorPickerAlphaSliderTrack className={styles.alphaSliderTrack} />
              <ColorPickerAlphaSliderThumb className={styles.alphaSliderThumb} />
            </ColorPickerAlphaSlider>
            <div className="flex items-center gap-2">
              <ColorPickerInput className={`${styles.input} flex-1`} classNames={styles.inputClassNames} />
              <ColorPickerEyeDropper className={styles.eyeDropper} classNames={styles.eyeDropperClassNames} />
            </div>
            <ColorPickerSwatches values={DEFAULT_SWATCH_COLORS} className={styles.swatches}>
              {DEFAULT_SWATCH_COLORS.map((color) => (
                <ColorPickerSwatch key={color} value={color} className={styles.swatch} />
              ))}
            </ColorPickerSwatches>
          </>
        )}
      </ColorPickerContent>
    </ColorPicker>
  );
}
