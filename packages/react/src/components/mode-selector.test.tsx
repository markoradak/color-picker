import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./color-picker";
import { createDefaultGradient } from "../utils/gradient";
import type { ColorPickerValue, GradientValue } from "../types";

/**
 * Helper to render a mode selector inside the ColorPicker context.
 */
function renderModeSelector(
  value: ColorPickerValue,
  onValueChange?: (v: ColorPickerValue) => void
) {
  return render(
    <ColorPicker value={value} onValueChange={onValueChange ?? (() => {})}>
      <ColorPicker.ModeSelector />
    </ColorPicker>
  );
}

describe("ColorPickerModeSelector", () => {
  it("renders all 5 mode options", () => {
    renderModeSelector("#ff0000");
    expect(screen.getByRole("radio", { name: /solid/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /linear/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /radial/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /conic/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /mesh/i })).toBeInTheDocument();
  });

  it("marks Solid as active when value is a string", () => {
    renderModeSelector("#ff0000");
    const solidBtn = screen.getByRole("radio", { name: /solid/i });
    expect(solidBtn).toHaveAttribute("aria-checked", "true");
    const linearBtn = screen.getByRole("radio", { name: /linear/i });
    expect(linearBtn).toHaveAttribute("aria-checked", "false");
  });

  it("marks Linear as active when value is a linear gradient", () => {
    const gradient = createDefaultGradient("linear");
    renderModeSelector(gradient);
    const linearBtn = screen.getByRole("radio", { name: /linear/i });
    expect(linearBtn).toHaveAttribute("aria-checked", "true");
    const solidBtn = screen.getByRole("radio", { name: /solid/i });
    expect(solidBtn).toHaveAttribute("aria-checked", "false");
  });

  it("transitions from Solid to Linear gradient", () => {
    const onChange = vi.fn();
    renderModeSelector("#ff0000", onChange);

    fireEvent.click(screen.getByRole("radio", { name: /linear/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "linear",
        stops: expect.arrayContaining([
          expect.objectContaining({ position: 0 }),
          expect.objectContaining({ color: "#ffffff", position: 100 }),
        ]),
      })
    );
  });

  it("transitions from Linear to Solid (extracts first stop color)", () => {
    const onChange = vi.fn();
    const gradient: GradientValue = {
      type: "linear",
      angle: 90,
      stops: [
        { id: "s1", color: "#ff0000", position: 0 },
        { id: "s2", color: "#0000ff", position: 100 },
      ],
    };
    renderModeSelector(gradient, onChange);

    fireEvent.click(screen.getByRole("radio", { name: /solid/i }));

    // Should extract a color (first stop)
    expect(onChange).toHaveBeenCalledWith(expect.any(String));
  });

  it("transitions from Linear to Radial (preserves stops)", () => {
    const onChange = vi.fn();
    const gradient: GradientValue = {
      type: "linear",
      angle: 90,
      stops: [
        { id: "s1", color: "#ff0000", position: 0 },
        { id: "s2", color: "#0000ff", position: 100 },
      ],
    };
    renderModeSelector(gradient, onChange);

    fireEvent.click(screen.getByRole("radio", { name: /radial/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "radial",
        stops: expect.arrayContaining([
          expect.objectContaining({ id: "s1", color: "#ff0000" }),
          expect.objectContaining({ id: "s2", color: "#0000ff" }),
        ]),
      })
    );
  });

  it("does nothing when clicking the already-active mode", () => {
    const onChange = vi.fn();
    renderModeSelector("#ff0000", onChange);

    fireEvent.click(screen.getByRole("radio", { name: /solid/i }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has the correct radiogroup aria-label", () => {
    renderModeSelector("#ff0000");
    expect(screen.getByRole("radiogroup", { name: /color picker mode/i })).toBeInTheDocument();
  });
});
