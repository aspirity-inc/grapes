import { createGrapesBunch, createGrape } from "../src/grapes";

const UNKNOWN_GRAPE = createGrape<unknown>("UNKNOWN_GRAPE");

describe("grapesBunch.ts", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("GrapesBunch.get", () => {
    it("should return undefined for unset grape", () => {
      const bunch = createGrapesBunch();

      const grapeValue = bunch.get(UNKNOWN_GRAPE);

      expect(grapeValue).toBe(undefined);
    });

    it("should return default value for unset grape", () => {
      const bunch = createGrapesBunch();
      const defaultValue = Symbol("DEFAULT_VALUE");

      const grapeValue = bunch.get(UNKNOWN_GRAPE, defaultValue);

      expect(grapeValue).toBe(defaultValue);
    });

    it("should return default value from getter for unset grape", () => {
      const bunch = createGrapesBunch();
      const defaultValue = Symbol("DEFAULT_VALUE");
      const defaultGetter = jest.fn().mockReturnValue(defaultValue);

      const grapeValue = bunch.get(UNKNOWN_GRAPE, defaultGetter);

      expect(grapeValue).toBe(defaultValue);
      expect(defaultGetter).toHaveBeenCalledTimes(1);
    });

    it.each([[undefined], [null], [Symbol("VALUE")]])(
      "should return %p for set grape",
      (value) => {
        const bunch = createGrapesBunch();
        bunch.set(UNKNOWN_GRAPE, value);

        const grapeValue = bunch.get(UNKNOWN_GRAPE);

        expect(grapeValue).toBe(value);
      }
    );

    it.each([[undefined], [null], [""], [0], [Symbol("VALUE")]])(
      "should return %p instead of default value for set grape",
      (value) => {
        const bunch = createGrapesBunch();
        bunch.set(UNKNOWN_GRAPE, value);
        const defaultValue = Symbol("DEFAULT_VALUE");

        const grapeValue = bunch.get(UNKNOWN_GRAPE, defaultValue);

        expect(grapeValue).toBe(value);
      }
    );
  });

  describe("GrapesBunch.on", () => {
    it("should call callback when new value is set", () => {
      const bunch = createGrapesBunch();
      const fn = jest.fn();
      const value = Symbol("value");
      const anotherValue = Symbol("anotherValue");

      bunch.on(UNKNOWN_GRAPE, fn);
      bunch.set(UNKNOWN_GRAPE, value);
      bunch.set(UNKNOWN_GRAPE, anotherValue);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(1, value);
      expect(fn).toHaveBeenNthCalledWith(2, anotherValue);
    });

    it("should NOT call callback when the same value is set", () => {
      const bunch = createGrapesBunch();
      const fn = jest.fn();
      const value = Symbol("value");

      bunch.on(UNKNOWN_GRAPE, fn);
      bunch.set(UNKNOWN_GRAPE, value);
      bunch.set(UNKNOWN_GRAPE, value);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenNthCalledWith(1, value);
    });

    it("should NOT call callback if unsubscribed", () => {
      const bunch = createGrapesBunch();
      const fn = jest.fn();
      const value = Symbol("value");
      const anotherValue = Symbol("anotherValue");

      const unsubscribe = bunch.on(UNKNOWN_GRAPE, fn);
      bunch.set(UNKNOWN_GRAPE, value);
      unsubscribe();
      bunch.set(UNKNOWN_GRAPE, anotherValue);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenNthCalledWith(1, value);
    });

    it("should remove grape when last listener unsubscribes", () => {
      jest.useFakeTimers();
      const bunch = createGrapesBunch();
      const value = Symbol("value");
      bunch.set(UNKNOWN_GRAPE, value);

      const unsubscribe = bunch.on(UNKNOWN_GRAPE, jest.fn());
      unsubscribe();
      const missing = Symbol("missing");
      const valueBefore = bunch.get(UNKNOWN_GRAPE, missing);
      jest.runOnlyPendingTimers();
      const valueAfter = bunch.get(UNKNOWN_GRAPE, missing);

      expect(valueBefore).toBe(value);
      expect(valueAfter).toBe(missing);
    });

    it("should remove grape when last listener unsubscribes with custom timeout", () => {
      jest.useFakeTimers();
      const cleanAfter = 100;
      const bunch = createGrapesBunch({ cleanupTimeoutMs: cleanAfter });
      const value = Symbol("value");
      bunch.set(UNKNOWN_GRAPE, value);

      const unsubscribe = bunch.on(UNKNOWN_GRAPE, jest.fn());
      unsubscribe();
      const missing = Symbol("missing");
      jest.advanceTimersByTime(cleanAfter - 1);
      const valueBefore = bunch.get(UNKNOWN_GRAPE, missing);
      jest.advanceTimersByTime(1);
      const valueAfter = bunch.get(UNKNOWN_GRAPE, missing);

      expect(valueBefore).toBe(value);
      expect(valueAfter).toBe(missing);
    });
  });
});
