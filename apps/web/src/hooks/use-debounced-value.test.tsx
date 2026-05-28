import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates value after debounce delay", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "커" } },
    );

    expect(result.current).toBe("커");

    rerender({ value: "커피" });
    expect(result.current).toBe("커");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("커");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("커피");
  });

  it("cleans up previous timer when value changes quickly", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 200),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "abc" });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("abc");
  });
});
