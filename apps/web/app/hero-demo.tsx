"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerInput,
  ColorPickerFormatToggle,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  toCSS,
} from "@markoradak/color-picker";
import type { ColorPickerValue, GradientValue } from "@markoradak/color-picker";

const SWATCHES = [
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
  const [color, setColor] = useState<ColorPickerValue>("#3b82f6");

  const cssValue = typeof color === "string" ? color : toCSS(color);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-[272px]">
        <ColorPicker value={color} onValueChange={setColor}>
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            <ColorPickerArea />
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
            <div className="flex items-center gap-2">
              <ColorPickerInput className="flex-1" />
              <ColorPickerFormatToggle />
              <ColorPickerEyeDropper />
            </div>
            <ColorPickerSwatches colors={SWATCHES} />
          </div>
        </ColorPicker>
      </div>

      {/* Live preview of the selected color */}
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-lg border border-neutral-200 shadow-sm dark:border-neutral-700"
          style={{ background: cssValue }}
          aria-label={`Selected color: ${cssValue}`}
        />
        <code className="rounded-md bg-neutral-100 px-3 py-1.5 font-mono text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          {cssValue}
        </code>
      </div>
    </div>
  );
}

export function GradientDemo() {
  const [gradient, setGradient] = useState<ColorPickerValue>({
    type: "linear",
    angle: 135,
    stops: [
      { id: "s1", color: "#3b82f6", position: 0 },
      { id: "s2", color: "#8b5cf6", position: 50 },
      { id: "s3", color: "#ec4899", position: 100 },
    ],
  } satisfies GradientValue);

  const cssValue = typeof gradient === "string" ? gradient : toCSS(gradient);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="h-32 w-full rounded-xl border border-neutral-200 shadow-inner dark:border-neutral-700"
        style={{ background: cssValue }}
        aria-label={`Gradient preview: ${cssValue}`}
      />
      <code className="block w-full overflow-x-auto rounded-md bg-neutral-100 px-3 py-2 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        {cssValue}
      </code>
    </div>
  );
}
