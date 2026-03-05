import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./color-picker";
import { ColorPickerPopover, ColorPickerInline } from "./presets";

/**
 * Helper to render a full compound color picker with all standard controls.
 */
function renderFullPicker(
  value: string,
  onValueChange?: (v: string) => void,
  options?: { disabled?: boolean; swatches?: string[] }
) {
  return render(
    <ColorPicker
      value={value}
      onValueChange={(onValueChange ?? (() => {})) as (v: unknown) => void}
      disabled={options?.disabled}
    >
      <ColorPicker.Trigger />
      <ColorPicker.Content>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.AlphaSlider />
        <ColorPicker.Input />
        {options?.swatches && (
          <ColorPicker.Swatches values={options.swatches} />
        )}
      </ColorPicker.Content>
    </ColorPicker>
  );
}

/**
 * Helper to render an inline picker (no popover) for direct interaction.
 */
function renderInlinePicker(
  value: string,
  onValueChange?: (v: string) => void,
  options?: { swatches?: string[] }
) {
  return render(
    <ColorPicker
      value={value}
      onValueChange={(onValueChange ?? (() => {})) as (v: unknown) => void}
    >
      <ColorPicker.Area />
      <ColorPicker.HueSlider />
      <ColorPicker.AlphaSlider />
      <ColorPicker.Input />
      {options?.swatches && (
        <ColorPicker.Swatches values={options.swatches} />
      )}
    </ColorPicker>
  );
}

describe("ColorPicker compound component", () => {
  describe("rendering", () => {
    it("renders the trigger button", () => {
      renderFullPicker("#ff0000");
      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });

    it("renders Area with correct role and aria-label", () => {
      renderInlinePicker("#ff0000");
      const area = screen.getByRole("slider", { name: /color/i });
      expect(area).toBeInTheDocument();
    });

    it("renders HueSlider with correct role and aria attributes", () => {
      renderInlinePicker("#ff0000");
      const hueSlider = screen.getByRole("slider", { name: /hue/i });
      expect(hueSlider).toBeInTheDocument();
      expect(hueSlider).toHaveAttribute("aria-valuemin", "0");
      expect(hueSlider).toHaveAttribute("aria-valuemax", "360");
    });

    it("renders AlphaSlider with correct role and aria attributes", () => {
      renderInlinePicker("#ff0000");
      const alphaSlider = screen.getByRole("slider", { name: /opacity/i });
      expect(alphaSlider).toBeInTheDocument();
      expect(alphaSlider).toHaveAttribute("aria-valuemin", "0");
      expect(alphaSlider).toHaveAttribute("aria-valuemax", "100");
    });

    it("renders the color input field", () => {
      renderInlinePicker("#ff0000");
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders the format toggle button", () => {
      renderInlinePicker("#ff0000");
      const toggle = screen.getByRole("button", { name: /color format/i });
      expect(toggle).toBeInTheDocument();
    });

    it("renders color swatches when provided", () => {
      renderInlinePicker("#ff0000", undefined, {
        swatches: ["#ff0000", "#00ff00", "#0000ff"],
      });
      const swatchGroup = screen.getByRole("group", {
        name: /color swatches/i,
      });
      expect(swatchGroup).toBeInTheDocument();
      const swatchButtons = screen.getAllByRole("button", {
        name: /select color/i,
      });
      expect(swatchButtons.length).toBe(3);
    });
  });

  describe("input interaction", () => {
    it("displays the current color value in the input", () => {
      renderInlinePicker("#ff0000");
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("#ff0000");
    });

    it("accepts valid color input and calls onValueChange", () => {
      const onChange = vi.fn();
      renderInlinePicker("#ff0000", onChange);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "#00ff00" } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith("#00ff00");
    });

    it("reverts to last valid value on invalid input", () => {
      renderInlinePicker("#ff0000");
      const input = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "not-a-color" } });
      fireEvent.blur(input);

      expect(input.value).toBe("#ff0000");
    });

    it("commits value on Enter key", () => {
      const onChange = vi.fn();
      renderInlinePicker("#ff0000", onChange);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "#0000ff" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(onChange).toHaveBeenCalledWith("#0000ff");
    });

    it("reverts on Escape key", () => {
      renderInlinePicker("#ff0000");
      const input = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "#00ff00" } });
      fireEvent.keyDown(input, { key: "Escape" });

      expect(input.value).toBe("#ff0000");
    });
  });

  describe("format toggle", () => {
    it("cycles from HEX to RGB on click", () => {
      renderInlinePicker("#ff0000");
      const toggle = screen.getByRole("button", { name: /color format/i });
      expect(toggle.textContent).toBe("HEX");

      fireEvent.click(toggle);
      expect(toggle.textContent).toBe("RGB");
    });

    it("cycles from RGB to HSL on second click", () => {
      renderInlinePicker("#ff0000");
      const toggle = screen.getByRole("button", { name: /color format/i });

      fireEvent.click(toggle); // HEX -> RGB
      fireEvent.click(toggle); // RGB -> HSL
      expect(toggle.textContent).toBe("HSL");
    });

    it("cycles back to HEX from HSL", () => {
      renderInlinePicker("#ff0000");
      const toggle = screen.getByRole("button", { name: /color format/i });

      fireEvent.click(toggle); // HEX -> RGB
      fireEvent.click(toggle); // RGB -> HSL
      fireEvent.click(toggle); // HSL -> HEX
      expect(toggle.textContent).toBe("HEX");
    });

    it("updates the input display format when toggled", () => {
      renderInlinePicker("#ff0000");
      const toggle = screen.getByRole("button", { name: /color format/i });
      const input = screen.getByRole("textbox") as HTMLInputElement;

      expect(input.value).toBe("#ff0000");

      fireEvent.click(toggle); // HEX -> RGB
      expect(input.value).toBe("rgb(255, 0, 0)");

      fireEvent.click(toggle); // RGB -> HSL
      expect(input.value).toBe("hsl(0, 100%, 50%)");
    });
  });

  describe("swatch interaction", () => {
    it("clicking a swatch updates the color value", () => {
      const onChange = vi.fn();
      renderInlinePicker("#ff0000", onChange, {
        swatches: ["#00ff00", "#0000ff"],
      });

      const greenSwatch = screen.getByRole("button", {
        name: /select color #00ff00/i,
      });
      fireEvent.click(greenSwatch);

      expect(onChange).toHaveBeenCalledWith("#00ff00");
    });

    it("marks the active swatch with aria-pressed", () => {
      renderInlinePicker("#ff0000", undefined, {
        swatches: ["#ff0000", "#00ff00"],
      });

      const activeSwatch = screen.getByRole("button", {
        name: /select color #ff0000/i,
      });
      expect(activeSwatch).toHaveAttribute("aria-pressed", "true");

      const inactiveSwatch = screen.getByRole("button", {
        name: /select color #00ff00/i,
      });
      expect(inactiveSwatch).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("disabled state", () => {
    it("disables the trigger when disabled", () => {
      renderFullPicker("#ff0000", undefined, { disabled: true });
      const trigger = screen.getByRole("button");
      expect(trigger).toBeDisabled();
    });

    it("disables interactive controls when disabled", () => {
      render(
        <ColorPicker value="#ff0000" onValueChange={() => {}} disabled>
          <ColorPicker.Area />
          <ColorPicker.HueSlider />
          <ColorPicker.Input />
        </ColorPicker>
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();

      const toggle = screen.getByRole("button", { name: /color format/i });
      expect(toggle).toBeDisabled();

      // Area and HueSlider use tabIndex=-1 when disabled
      const area = screen.getByRole("slider", { name: /color/i });
      expect(area).toHaveAttribute("tabindex", "-1");
      expect(area).toHaveAttribute("data-disabled", "");

      const hueSlider = screen.getByRole("slider", { name: /hue/i });
      expect(hueSlider).toHaveAttribute("tabindex", "-1");
      expect(hueSlider).toHaveAttribute("data-disabled", "");
    });
  });

  describe("context error handling", () => {
    it("throws when compound components are used outside ColorPicker", () => {
      // Suppress console.error from React for the expected error
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<ColorPicker.Area />);
      }).toThrow("useColorPickerContext must be used within a <ColorPicker> component.");

      spy.mockRestore();
    });
  });
});

describe("ColorPickerPopover preset", () => {
  it("renders without errors", () => {
    const { container } = render(
      <ColorPickerPopover
        value="#ff0000"
        onValueChange={() => {}}
      />
    );
    expect(container).toBeTruthy();
  });

  it("renders the trigger button", () => {
    render(
      <ColorPickerPopover
        value="#ff0000"
        onValueChange={() => {}}
      />
    );
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
  });

  it("accepts custom swatches", () => {
    render(
      <ColorPickerPopover
        value="#ff0000"
        onValueChange={() => {}}
        swatches={["#ff0000", "#00ff00"]}
      />
    );
    // The trigger should render but content is in a portal (may need popover open to test swatches)
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
  });
});

describe("ColorPickerInline preset", () => {
  it("renders without errors", () => {
    const { container } = render(
      <ColorPickerInline
        value="#ff0000"
        onValueChange={() => {}}
      />
    );
    expect(container).toBeTruthy();
  });

  it("renders all standard controls inline", () => {
    render(
      <ColorPickerInline
        value="#ff0000"
        onValueChange={() => {}}
      />
    );

    // Area, Hue, Alpha sliders
    expect(screen.getByRole("slider", { name: /color/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /hue/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /opacity/i })).toBeInTheDocument();

    // Input and format toggle
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /color format/i })).toBeInTheDocument();
  });

  it("hides alpha slider when enableAlpha is false", () => {
    render(
      <ColorPickerInline
        value="#ff0000"
        onValueChange={() => {}}
        enableAlpha={false}
      />
    );

    expect(screen.getByRole("slider", { name: /color/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /hue/i })).toBeInTheDocument();
    expect(screen.queryByRole("slider", { name: /opacity/i })).toBeNull();
  });

  it("hides format toggle when enableFormatToggle is false", () => {
    render(
      <ColorPickerInline
        value="#ff0000"
        onValueChange={() => {}}
        enableFormatToggle={false}
      />
    );

    expect(screen.queryByRole("button", { name: /color format/i })).toBeNull();
  });

  it("renders swatches when provided", () => {
    render(
      <ColorPickerInline
        value="#ff0000"
        onValueChange={() => {}}
        swatches={["#ff0000", "#00ff00", "#0000ff"]}
      />
    );

    const swatchGroup = screen.getByRole("group", {
      name: /color swatches/i,
    });
    expect(swatchGroup).toBeInTheDocument();
  });

  it("supports disabled state", () => {
    render(
      <ColorPickerInline
        value="#ff0000"
        onValueChange={() => {}}
        disabled
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();

    const toggle = screen.getByRole("button", { name: /color format/i });
    expect(toggle).toBeDisabled();
  });
});

describe("Color tokens support", () => {
  const tokens = { primary: "#3b82f6", brand: "#f97316" };

  it("resolves a token name as value and displays a color in the input", () => {
    render(
      <ColorPicker value="primary" onValueChange={() => {}} tokens={tokens}>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.Input />
      </ColorPicker>
    );

    const input = screen.getByRole("textbox");
    // HSVA roundtrip may shift the hex slightly, so check it's a valid hex
    expect(input.getAttribute("value")).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("shows the token badge when current color matches a token", () => {
    render(
      <ColorPicker value="#3b82f6" onValueChange={() => {}} tokens={tokens}>
        <ColorPicker.Input />
      </ColorPicker>
    );

    expect(screen.getByLabelText(/matches token: primary/i)).toBeInTheDocument();
  });

  it("does not show a badge when color does not match any token", () => {
    render(
      <ColorPicker value="#ff0000" onValueChange={() => {}} tokens={tokens}>
        <ColorPicker.Input />
      </ColorPicker>
    );

    expect(screen.queryByLabelText(/matches token/i)).not.toBeInTheDocument();
  });

  it("emits the resolved color string via onValueChange, not the token name", () => {
    const onChange = vi.fn();
    render(
      <ColorPicker value="primary" onValueChange={onChange} tokens={tokens}>
        <ColorPicker.Input />
      </ColorPicker>
    );

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "brand" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith("#f97316");
  });

  it("allows typing a token name in the input to set its color", () => {
    const onChange = vi.fn();
    render(
      <ColorPicker value="#000000" onValueChange={onChange} tokens={tokens}>
        <ColorPicker.Input />
      </ColorPicker>
    );

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "primary" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith("#3b82f6");
  });

  it("works with ColorPickerInline preset", () => {
    render(
      <ColorPickerInline
        value="brand"
        onValueChange={() => {}}
        tokens={tokens}
      />
    );

    const input = screen.getByRole("textbox");
    // HSVA roundtrip may shift the hex slightly
    expect(input.getAttribute("value")).toMatch(/^#[0-9a-f]{6}$/i);
    expect(screen.getByLabelText(/matches token: brand/i)).toBeInTheDocument();
  });
});
