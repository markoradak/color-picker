import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPickerProvider } from "./color-picker-provider";
import { ColorPickerArea } from "./area";
import { ColorPickerHueSlider } from "./hue-slider";
import { ColorPickerInput } from "./input";

describe("ColorPickerProvider", () => {
  it("provides context to child components", () => {
    render(
      <ColorPickerProvider value="#ff0000" onValueChange={() => {}}>
        <ColorPickerArea />
        <ColorPickerHueSlider />
        <ColorPickerInput />
      </ColorPickerProvider>
    );

    expect(screen.getByRole("slider", { name: /color/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /hue/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays the controlled color value", () => {
    render(
      <ColorPickerProvider value="#ff0000" onValueChange={() => {}}>
        <ColorPickerInput />
      </ColorPickerProvider>
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("#ff0000");
  });

  it("calls onValueChange when color is modified", () => {
    const onChange = vi.fn();
    render(
      <ColorPickerProvider value="#ff0000" onValueChange={onChange}>
        <ColorPickerInput />
      </ColorPickerProvider>
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "#00ff00" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith("#00ff00");
  });

  it("supports uncontrolled mode with defaultValue", () => {
    render(
      <ColorPickerProvider defaultValue="#0000ff">
        <ColorPickerInput />
      </ColorPickerProvider>
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("#0000ff");
  });

  it("passes disabled state to children", () => {
    render(
      <ColorPickerProvider value="#ff0000" onValueChange={() => {}} disabled>
        <ColorPickerInput />
      </ColorPickerProvider>
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
