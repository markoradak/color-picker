"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerInput,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerModeSelector,
  ColorPickerGradientEditor,
  ColorPickerGradientSwatches,
  ColorPickerInputTrigger,
  ColorPickerContent,
} from "@markoradak/color-picker";
import type { ColorPickerValue } from "@markoradak/color-picker";
import { styles } from "./component-styles";

export function HeroDemo() {
  const [value, setValue] = useState<ColorPickerValue>("#16db89");

  const isGradientMode = typeof value !== "string";

  return (
    <ColorPicker value={value} onValueChange={setValue} defaultOpen>
      <div className="w-80">
        <ColorPickerInputTrigger
          className={styles.inputTrigger}
          classNames={styles.inputTriggerClassNames}
        />
      </div>
      <ColorPickerContent className={styles.content} style={{ width: "var(--radix-popper-anchor-width)" }}>
        <ColorPickerModeSelector
          className={styles.modeSelector}
          classNames={styles.modeSelectorClassNames}
        />
        {isGradientMode ? (
          <>
            <ColorPickerGradientEditor
              className={styles.gradientEditor}
              classNames={styles.gradientEditorClassNames}
            />
            <ColorPickerGradientSwatches
              className={styles.gradientSwatches}
              classNames={styles.gradientSwatchClassNames}
            />
          </>
        ) : (
          <>
            <ColorPickerArea
              className={styles.area}
              classNames={styles.areaClassNames}
            />
            <ColorPickerHueSlider
              className={styles.hueSlider}
              classNames={styles.hueSliderClassNames}
            />
            <ColorPickerAlphaSlider
              className={styles.alphaSlider}
              classNames={styles.alphaSliderClassNames}
            />
            <div className="flex items-center gap-2">
              <ColorPickerInput
                className={`${styles.input} flex-1`}
                classNames={styles.inputClassNames}
              />
              <ColorPickerEyeDropper className={styles.eyeDropper} classNames={styles.eyeDropperClassNames} />
            </div>
            <ColorPickerSwatches
              className={styles.swatches}
              classNames={styles.swatchClassNames}
            />
          </>
        )}
      </ColorPickerContent>
    </ColorPicker>
  );
}
