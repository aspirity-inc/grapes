import React from "react";
import {
  act,
  renderHook,
  RenderHookOptions,
} from "@testing-library/react-hooks";
import {
  useGrape,
  useGrapesBunch,
  createGrape,
  createGrapesBunch,
  GrapesBunchProvider,
  GrapesBunch,
} from "../src/grapes";

function createOptions(bunch: GrapesBunch): RenderHookOptions<{}> {
  return {
    wrapper: ({ children }) => (
      <GrapesBunchProvider value={bunch}>{children}</GrapesBunchProvider>
    ),
  };
}

describe("useGrape.ts", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("useGrapesBunch", () => {
    it("should return a default bunch", () => {
      const { result } = renderHook(() => useGrapesBunch());
      expect(result.current).toBeTruthy();
    });

    it("should return a bunch form a provider", () => {
      const bunch = createGrapesBunch();

      const { result } = renderHook(
        () => useGrapesBunch(),
        createOptions(bunch)
      );

      expect(result.current).toBe(bunch);
    });
  });

  describe("useGrape", () => {
    it("should return default value for unset grape", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");

      const { result } = renderHook(() => useGrape(grape, defaultValue));

      expect(result.current).toStrictEqual([
        defaultValue,
        expect.any(Function),
      ]);
    });

    it("should set default value to bunch for unset grape", () => {
      const bunch = createGrapesBunch();
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");

      renderHook(() => useGrape(grape, defaultValue), createOptions(bunch));

      expect(bunch.get(grape)).toBe(defaultValue);
    });

    it("should return a grape value", () => {
      const bunch = createGrapesBunch();
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const value = Symbol("VALUE");
      bunch.set(grape, value);

      const { result } = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch)
      );

      expect(result.current).toStrictEqual([value, expect.any(Function)]);
    });

    it("should not set default value to bunch for set grape", () => {
      const bunch = createGrapesBunch();
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const value = Symbol("VALUE");
      bunch.set(grape, value);

      renderHook(() => useGrape(grape, defaultValue), createOptions(bunch));

      expect(bunch.get(grape)).toBe(value);
    });

    it("should return updated value after setting new grape value", () => {
      const bunch = createGrapesBunch();
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const value = Symbol("VALUE");
      bunch.set(grape, value);
      const hook = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch)
      );
      expect(bunch.get(grape)).toBe(value);
      const anotherValue = Symbol("ANOTHER_VALUE");

      act(() => {
        bunch.set(grape, anotherValue);
      });

      expect(hook.result.current).toStrictEqual([
        anotherValue,
        expect.any(Function),
      ]);
    });

    it("should clean grape after unmount", () => {
      jest.useFakeTimers();
      const bunch = createGrapesBunch();
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const hook = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch)
      );
      expect(bunch.get(grape)).toBe(defaultValue);

      hook.unmount();
      jest.runOnlyPendingTimers();

      const missing = Symbol("missing");
      expect(bunch.get(grape, missing)).toBe(missing);
    });

    it("should set grape value in bunch from hook (value set)", () => {
      const bunch = createGrapesBunch();
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const {
        result: {
          current: [, setValue],
        },
      } = renderHook(() => useGrape(grape, defaultValue), createOptions(bunch));
      expect(bunch.get(grape)).toBe(defaultValue);
      const value = Symbol("VALUE");

      act(() => setValue(value));

      expect(bunch.get(grape)).toBe(value);
    });

    it("should set grape value in bunch from hook (function set)", () => {
      const bunch = createGrapesBunch();
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const {
        result: {
          current: [, setValue],
        },
      } = renderHook(() => useGrape(grape, defaultValue), createOptions(bunch));
      expect(bunch.get(grape)).toBe(defaultValue);
      const value = Symbol("VALUE");

      act(() => setValue(() => value));

      expect(bunch.get(grape)).toBe(value);
    });
  });
});
