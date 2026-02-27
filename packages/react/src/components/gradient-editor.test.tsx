import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./color-picker";
import { createDefaultGradient } from "../utils/gradient";
import type { ColorPickerValue, GradientValue } from "../types";

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

  it("renders gradient type selector with all four types", () => {
    const gradient = createDefaultGradient("linear");
    renderGradientEditor(gradient);
    expect(screen.getByRole("radio", { name: /linear/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /radial/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /conic/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /mesh/i })).toBeInTheDocument();
  });

  it("marks the active gradient type", () => {
    const gradient = createDefaultGradient("linear");
    renderGradientEditor(gradient);
    const linearBtn = screen.getByRole("radio", { name: /linear/i });
    expect(linearBtn).toHaveAttribute("aria-checked", "true");
    const radialBtn = screen.getByRole("radio", { name: /radial/i });
    expect(radialBtn).toHaveAttribute("aria-checked", "false");
  });

  it("switches gradient type on click", () => {
    const onChange = vi.fn();
    const gradient = createDefaultGradient("linear");
    renderGradientEditor(gradient, onChange);

    fireEvent.click(screen.getByRole("radio", { name: /radial/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "radial" })
    );
  });

  it("shows angle input for linear gradient", () => {
    const gradient = createDefaultGradient("linear");
    renderGradientEditor(gradient);
    expect(screen.getByLabelText(/angle/i)).toBeInTheDocument();
  });

  it("shows center inputs for radial gradient", () => {
    const gradient = createDefaultGradient("radial");
    renderGradientEditor(gradient);
    expect(screen.getByLabelText(/center x/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/center y/i)).toBeInTheDocument();
  });

  it("renders the gradient preview", () => {
    const gradient = createDefaultGradient("linear");
    const { container } = renderGradientEditor(gradient);
    const preview = container.querySelector(".cp-gradient-preview");
    expect(preview).not.toBeNull();
  });

  it("renders the gradient stops bar", () => {
    const gradient = createDefaultGradient("linear");
    const { container } = renderGradientEditor(gradient);
    const stops = container.querySelector(".cp-gradient-stops");
    expect(stops).not.toBeNull();
  });

  it("renders stop markers for each gradient stop", () => {
    const gradient = createDefaultGradient("linear");
    renderGradientEditor(gradient);
    // Default gradient has 2 stops
    const stopButtons = screen.getAllByRole("button", { name: /gradient stop/i });
    expect(stopButtons.length).toBe(2);
  });

  it("shows angle and center for conic gradient", () => {
    const gradient = createDefaultGradient("conic");
    renderGradientEditor(gradient);
    expect(screen.getByLabelText(/angle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/center x/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/center y/i)).toBeInTheDocument();
  });

  it("hides angle/center controls for mesh gradient", () => {
    const gradient = createDefaultGradient("mesh");
    renderGradientEditor(gradient);
    expect(screen.queryByLabelText(/angle/i)).toBeNull();
    expect(screen.queryByLabelText(/center x/i)).toBeNull();
  });
});
