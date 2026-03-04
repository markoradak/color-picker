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
import type { ColorPickerValue, GradientValue } from "@markoradak/color-picker";

const DEFAULT_GRADIENT: GradientValue = {
  type: "linear",
  angle: 135,
  stops: [
    { id: "s1", color: "#16db89", position: 0 },
    { id: "s2", color: "#3b82f6", position: 50 },
    { id: "s3", color: "#8b5cf6", position: 100 },
  ],
};

export function HeroDemo() {
  const [value, setValue] = useState<ColorPickerValue>(DEFAULT_GRADIENT);

  const isGradientMode = typeof value !== "string";

  return (
    <ColorPicker value={value} onValueChange={setValue}>
      <ColorPickerInputTrigger />
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
