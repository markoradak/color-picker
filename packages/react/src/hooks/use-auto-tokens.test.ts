import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoTokens } from "./use-auto-tokens";
import * as colorUtils from "../utils/color";

// Mock getCSSColorTokens since DOM APIs aren't available in tests
vi.mock("../utils/color", async () => {
  const actual = await vi.importActual("../utils/color");
  return {
    ...actual,
    getCSSColorTokens: vi.fn(() => ({})),
  };
});

const mockGetCSSColorTokens = vi.mocked(colorUtils.getCSSColorTokens);

describe("useAutoTokens", () => {
  afterEach(() => {
    mockGetCSSColorTokens.mockReset();
    mockGetCSSColorTokens.mockReturnValue({});
  });

  it("returns auto-detected tokens when autoTokens is true", () => {
    mockGetCSSColorTokens.mockReturnValue({ primary: "#3b82f6" });
    const { result } = renderHook(() => useAutoTokens(true));
    expect(result.current).toEqual({ primary: "#3b82f6" });
    expect(mockGetCSSColorTokens).toHaveBeenCalledWith(undefined);
  });

  it("returns auto-detected tokens when autoTokens is undefined (default)", () => {
    mockGetCSSColorTokens.mockReturnValue({ primary: "#3b82f6" });
    const { result } = renderHook(() => useAutoTokens(undefined));
    expect(result.current).toEqual({ primary: "#3b82f6" });
  });

  it("passes prefix to getCSSColorTokens when configured", () => {
    mockGetCSSColorTokens.mockReturnValue({ red: "#ff0000" });
    const { result } = renderHook(() =>
      useAutoTokens({ prefix: "--brand-" })
    );
    expect(mockGetCSSColorTokens).toHaveBeenCalledWith("--brand-");
    expect(result.current).toEqual({ red: "#ff0000" });
  });

  it("returns only manual tokens when autoTokens is false", () => {
    const manual = { custom: "#ff0000" };
    const { result } = renderHook(() => useAutoTokens(false, manual));
    expect(mockGetCSSColorTokens).not.toHaveBeenCalled();
    expect(result.current).toEqual({ custom: "#ff0000" });
  });

  it("does not call getCSSColorTokens when autoTokens is false", () => {
    renderHook(() => useAutoTokens(false));
    expect(mockGetCSSColorTokens).not.toHaveBeenCalled();
  });

  it("merges auto-detected and manual tokens with manual winning", () => {
    mockGetCSSColorTokens.mockReturnValue({
      primary: "#3b82f6",
      secondary: "#6366f1",
    });
    const manual = { primary: "#ff0000", custom: "#00ff00" };
    const { result } = renderHook(() => useAutoTokens(true, manual));
    expect(result.current).toEqual({
      primary: "#ff0000", // manual override wins
      secondary: "#6366f1", // from auto
      custom: "#00ff00", // manual only
    });
  });

  it("returns undefined when both auto and manual are empty", () => {
    mockGetCSSColorTokens.mockReturnValue({});
    const { result } = renderHook(() => useAutoTokens(true));
    expect(result.current).toBeUndefined();
  });

  it("returns manual tokens when auto returns empty", () => {
    mockGetCSSColorTokens.mockReturnValue({});
    const manual = { custom: "#ff0000" };
    const { result } = renderHook(() => useAutoTokens(true, manual));
    expect(result.current).toEqual({ custom: "#ff0000" });
  });
});
