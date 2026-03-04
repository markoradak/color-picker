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

export function HeroDemo() {
  const [value, setValue] = useState<ColorPickerValue>("#16db89");

  const isGradientMode = typeof value !== "string";

  return (
    <ColorPicker value={value} onValueChange={setValue} defaultOpen>
      <div style={{ width: 'calc(var(--cp-width) + 2px)' }}>
        <ColorPickerInputTrigger />
      </div>
      <ColorPickerContent>
        <ColorPickerModeSelector />
        {isGradientMode ? (
          <>
            <ColorPickerGradientEditor />
            <ColorPickerGradientSwatches className="mt-0.5" />
          </>
        ) : (
          <>
            <ColorPickerArea />
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
            <div className="flex items-center gap-2">
              <ColorPickerInput className="flex-1" />
              <ColorPickerEyeDropper />
            </div>
            <ColorPickerSwatches />
          </>
        )}
      </ColorPickerContent>
    </ColorPicker>
  );
}
