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
  GrapesBunchProvider,
  GrapesBunch,
  Grape,
} from "../src/grapes";
import { getValue, noop } from "../src/utils";

const ANY_FN = expect.any(Function);

function createOptions(
  bunch: GrapesBunch,
  grape: Grape<unknown>
): RenderHookOptions<{
  currentBunch: GrapesBunch;
  currentGrape: Grape<unknown>;
}> {
  return {
    wrapper: ({ children, currentBunch }) => (
      <GrapesBunchProvider value={currentBunch}>{children}</GrapesBunchProvider>
    ),
    initialProps: {
      currentBunch: bunch,
      currentGrape: grape,
    },
  };
}

interface MockGrapesBunch extends GrapesBunch {
  get: jest.MockedFunction<GrapesBunch["get"]>;
  set: jest.MockedFunction<GrapesBunch["set"]>;
  on: jest.MockedFunction<GrapesBunch["on"]>;
}

function createMockGrapesBunch(off: () => void = noop): MockGrapesBunch {
  return {
    get: jest.fn(),
    set: jest.fn(),
    on: jest.fn().mockReturnValue(off),
  } as unknown as MockGrapesBunch;
}

function bunchGetReturnsDefault() {
  return (_grape: unknown, defaultValue: unknown) => getValue(defaultValue);
}

function bunchGetFromStore(store: Record<string, unknown>) {
  return (grape: string, defaultValue: unknown) =>
    grape in store ? store[grape] : getValue(defaultValue);
}

describe("useGrape.ts", () => {
  afterEach(() => {
    jest.useRealTimers();
    expect.hasAssertions();
  });

  describe("useGrapesBunch", () => {
    it("should return a default bunch", () => {
      const { result } = renderHook(() => useGrapesBunch());
      expect(result.current).toBeTruthy();
    });

    it("should return a bunch form a provider", () => {
      const bunch = createMockGrapesBunch();

      const { result } = renderHook(
        () => useGrapesBunch(),
        createOptions(bunch, createGrape<unknown>("unknown"))
      );

      expect(result.current).toBe(bunch);
    });
  });

  describe("useGrape", () => {
    it("should return default value for unset grape", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");

      const { result } = renderHook(() => useGrape(grape, defaultValue));

      expect(result.current).toStrictEqual([defaultValue, ANY_FN]);
    });

    it("should set default value to bunch for unset grape", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const bunch = createMockGrapesBunch();
      bunch.get.mockImplementationOnce(bunchGetReturnsDefault());

      renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );

      expect(bunch.set).toBeCalledTimes(1);
      expect(bunch.set).nthCalledWith(1, grape, defaultValue);
    });

    it("should return a grape value", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const value = Symbol("VALUE");
      const bunch = createMockGrapesBunch();
      bunch.get.mockReturnValue(value);

      const { result } = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );

      expect(result.current).toStrictEqual([value, ANY_FN]);
      expect(bunch.set).not.toBeCalled();
    });

    it("should subscribe for bunch changes on mount", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const bunch = createMockGrapesBunch();

      renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );

      expect(bunch.on).toBeCalledTimes(1);
      expect(bunch.on).nthCalledWith(1, grape, ANY_FN);
    });

    it("should return updated value after bunch changes callback is called", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const anotherValue = Symbol("ANOTHER_VALUE");
      const bunch = createMockGrapesBunch();

      const hook = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );

      act(() => {
        const onChangeCallback = bunch.on.mock.calls[0][1];
        onChangeCallback(anotherValue);
      });

      expect(hook.result.current).toStrictEqual([anotherValue, ANY_FN]);
    });

    it("should unsubscribe after unmount", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const bunch = createMockGrapesBunch();
      const off = jest.fn();
      bunch.on.mockReturnValue(off);
      const hook = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );

      hook.unmount();

      expect(off).toBeCalled();
    });

    it("should set grape value in bunch from hook (value set)", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const bunch = createMockGrapesBunch();
      const {
        result: {
          current: [, setValue],
        },
      } = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );
      const value = Symbol("VALUE");

      act(() => setValue(value));

      expect(bunch.set).toBeCalledWith(grape, value);
    });

    it("should set grape value in bunch from hook (function set)", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const value = Symbol("VALUE");
      const bunch = createMockGrapesBunch();
      const {
        result: {
          current: [, setValue],
        },
      } = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );

      act(() => setValue(() => value));

      expect(bunch.set).toBeCalledWith(grape, value);
    });

    it("should NOT resubscribe on value change", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const bunch = createMockGrapesBunch();
      const hook = renderHook(
        () => useGrape(grape, defaultValue),
        createOptions(bunch, grape)
      );

      hook.unmount();

      expect(bunch.on).toBeCalledTimes(1);
      expect(bunch.on).nthCalledWith(1, grape, ANY_FN);
    });

    it("should resubscribe on bunch change", () => {
      const grape = createGrape<unknown>("unknown");
      const defaultValue = Symbol("DEFAULT_VALUE");
      const initialOff = jest.fn();
      const anotherOff = jest.fn();
      const initialBunch = createMockGrapesBunch(initialOff);
      const anotherBunch = createMockGrapesBunch(anotherOff);
      const hook = renderHook(
        ({ currentGrape }) => useGrape(currentGrape, defaultValue),
        createOptions(initialBunch, grape)
      );

      hook.rerender({ currentBunch: anotherBunch, currentGrape: grape });

      expect(initialBunch.on).toBeCalledTimes(1);
      expect(initialBunch.on).nthCalledWith(1, grape, ANY_FN);
      expect(initialOff).toBeCalledTimes(1);
      expect(anotherBunch.on).toBeCalledTimes(1);
      expect(anotherBunch.on).nthCalledWith(1, grape, ANY_FN);
      expect(anotherOff).not.toBeCalled();
    });

    describe("grape change", () => {
      it("should resubscribe to new grape", () => {
        const initialGrape = createGrape<unknown>("unknown");
        const anotherGrape = createGrape<unknown>("unknown");
        const defaultValue = Symbol("DEFAULT_VALUE");
        const off = jest.fn();
        const bunch = createMockGrapesBunch(off);
        const hook = renderHook(
          ({ currentGrape }) => useGrape(currentGrape, defaultValue),
          createOptions(bunch, initialGrape)
        );

        hook.rerender({ currentBunch: bunch, currentGrape: anotherGrape });

        expect(bunch.on).toBeCalledTimes(2);
        expect(bunch.on).nthCalledWith(1, initialGrape, ANY_FN);
        expect(bunch.on).nthCalledWith(2, anotherGrape, ANY_FN);
        expect(off).toBeCalledTimes(1);
      });

      it("should set default value for unset grapes", () => {
        const initialGrape = createGrape<unknown>("unknown");
        const anotherGrape = createGrape<unknown>("unknown");
        const defaultValue = Symbol("DEFAULT_VALUE");
        const off = jest.fn();
        const bunch = createMockGrapesBunch(off);
        bunch.get.mockImplementation(bunchGetReturnsDefault());
        const hook = renderHook(
          ({ currentGrape }) => useGrape(currentGrape, defaultValue),
          createOptions(bunch, initialGrape)
        );
        expect(bunch.set).lastCalledWith(initialGrape, defaultValue);

        hook.rerender({ currentBunch: bunch, currentGrape: anotherGrape });

        expect(bunch.set).lastCalledWith(anotherGrape, defaultValue);
      });

      it("should NOT set value for set grapes", () => {
        const initialGrape = createGrape<unknown>("unknown");
        const anotherGrape = createGrape<unknown>("unknown");
        const defaultValue = Symbol("DEFAULT_VALUE");
        const store = {
          [initialGrape]: Symbol("initialGrape"),
          [anotherGrape]: Symbol("anotherGrape"),
        };
        const bunch = createMockGrapesBunch();
        bunch.get.mockImplementation(bunchGetFromStore(store));
        const hook = renderHook(
          ({ currentGrape }) => useGrape(currentGrape, () => defaultValue),
          createOptions(bunch, initialGrape)
        );

        hook.rerender({ currentBunch: bunch, currentGrape: anotherGrape });

        expect(bunch.set).not.toBeCalled();
      });

      it("should return new grape value", () => {
        const initialGrape = createGrape<unknown>("unknown");
        const anotherGrape = createGrape<unknown>("unknown");
        const defaultValue = Symbol("DEFAULT_VALUE");
        const store = {
          [initialGrape]: Symbol("initialGrape"),
          [anotherGrape]: Symbol("anotherGrape"),
        };
        const bunch = createMockGrapesBunch();
        bunch.get.mockImplementation(bunchGetFromStore(store));
        const hook = renderHook(
          ({ currentGrape }) => useGrape(currentGrape, defaultValue),
          createOptions(bunch, initialGrape)
        );
        expect(hook.result.current).toEqual([store[initialGrape], ANY_FN]);

        hook.rerender({ currentBunch: bunch, currentGrape: anotherGrape });

        expect(hook.result.current).toEqual([store[anotherGrape], ANY_FN]);
      });
    });
  });
});
