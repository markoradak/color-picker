import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ColorPicker } from "./color-picker";
import { createDefaultGradient } from "../utils/gradient";
import type { ColorPickerValue } from "../types";

/**
 * Helper to render a gradient editor inside the ColorPicker context.
 */
function renderGradientEditor(
  value: ColorPickerValue,
  onValueChange?: (v: ColorPickerValue) => void
) {
  return render(
    <ColorPicker value={value} onValueChange={onValueChange ?? (() => {})}>
      <ColorPicker.Area />
      <ColorPicker.HueSlider />
      <ColorPicker.GradientEditor />
    </ColorPicker>
  );
}

describe("GradientEditor", () => {
  it("renders nothing when value is a solid color", () => {
    const { container } = renderGradientEditor("#ff0000");
    const editor = container.querySelector(".cp-gradient-editor");
    expect(editor).toBeNull();
  });

  it("renders when value is a gradient", () => {
    const gradient = createDefaultGradient("linear");
    const { container } = renderGradientEditor(gradient);
    const editor = container.querySelector(".cp-gradient-editor");
    expect(editor).not.toBeNull();
  });

  it("renders the gradient preview", () => {
    const gradient = createDefaultGradient("linear");
    const { container } = renderGradientEditor(gradient);
    const preview = container.querySelector(".cp-gradient-preview");
    expect(preview).not.toBeNull();
  });

  it("renders stop dots for each gradient stop", () => {
    const gradient = createDefaultGradient("linear");
    renderGradientEditor(gradient);
    // Default gradient has 2 stops
    const stopButtons = screen.getAllByRole("button", { name: /stop/i });
    expect(stopButtons.length).toBe(2);
  });

  it("renders for all gradient types", () => {
    for (const type of ["linear", "radial", "conic", "mesh"] as const) {
      const gradient = createDefaultGradient(type);
      const { container } = renderGradientEditor(gradient);
      const preview = container.querySelector(".cp-gradient-preview");
      expect(preview).not.toBeNull();
      container.remove();
    }
  });
});
