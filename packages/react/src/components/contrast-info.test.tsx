import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ColorPickerContrastInfo } from "./contrast-info";
import { ColorPicker } from "./color-picker";

function renderContrastInfo(color: string, contrastColor: string) {
  return render(
    <ColorPicker defaultValue={color}>
      <ColorPickerContrastInfo contrastColor={contrastColor} data-testid="contrast" />
    </ColorPicker>,
  );
}

describe("ColorPickerContrastInfo", () => {
  it("renders the contrast ratio", () => {
    renderContrastInfo("#000000", "#ffffff");
    const el = screen.getByTestId("contrast");
    // Black on white = 21:1
    expect(el.textContent).toContain("21.00 : 1");
  });

  it("shows AAA for high contrast (black on white)", () => {
    renderContrastInfo("#000000", "#ffffff");
    const badge = document.querySelector('[data-cp-el="contrast-badge"]');
    expect(badge?.textContent).toContain("AAA");
    expect(badge?.getAttribute("data-pass")).toBe("");
    expect(badge?.getAttribute("data-level")).toBe("aaa");
  });

  it("shows Fail for low contrast (white on white)", () => {
    renderContrastInfo("#ffffff", "#ffffff");
    const badge = document.querySelector('[data-cp-el="contrast-badge"]');
    expect(badge?.textContent).toContain("Fail");
    expect(badge?.hasAttribute("data-pass")).toBe(false);
  });

  it("shows AA for medium contrast", () => {
    // #767676 on white ≈ 4.54:1, just above AA threshold
    renderContrastInfo("#767676", "#ffffff");
    const badge = document.querySelector('[data-cp-el="contrast-badge"]');
    expect(badge?.textContent).toContain("AA");
    expect(badge?.getAttribute("data-level")).toBe("aa");
  });

  it("renders the split-circle indicator button", () => {
    renderContrastInfo("#ff0000", "#ffffff");
    const indicator = document.querySelector('[data-cp-el="contrast-indicator"]');
    expect(indicator).toBeTruthy();
    expect(indicator?.tagName).toBe("BUTTON");
    expect(indicator?.querySelector("svg")).toBeTruthy();
  });

  it("sets data-cp-part attribute", () => {
    renderContrastInfo("#000000", "#ffffff");
    const el = screen.getByTestId("contrast");
    expect(el.getAttribute("data-cp-part")).toBe("contrast-info");
  });
});
