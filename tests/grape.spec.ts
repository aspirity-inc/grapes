import { createGrape } from "../src/grapes";

describe("grape", () => {
  describe("createGrape", () => {
    it("should return name with number suffix", () => {
      const grape = createGrape("grape");
      expect(grape).toMatch(/^grape\[\d+\]$/);
    });

    it("should return different grapes for the same names", () => {
      const TEST_NAME = "grape";
      const grape1 = createGrape(TEST_NAME);
      const grape2 = createGrape(TEST_NAME);
      expect(grape1).not.toBe(grape2);
    });
  });
});
