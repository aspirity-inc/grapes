import { setLogger } from "../src/grapes";
import { logDebug, logError, logWarn, log, Logger } from "../src/logger";

function callAllLogs() {
  const LOG_PARAM = Symbol("LOG_PARAM");
  const ERROR_PARAM = Symbol("ERROR_PARAM");
  const WARN_PARAM = Symbol("WARN_PARAM");
  const DEBUG_PARAM = Symbol("DEBUG_PARAM");
  log(LOG_PARAM, LOG_PARAM);
  logError(ERROR_PARAM, ERROR_PARAM);
  logWarn(WARN_PARAM, WARN_PARAM);
  logDebug(DEBUG_PARAM, DEBUG_PARAM);
  return {
    LOG_PARAM,
    ERROR_PARAM,
    WARN_PARAM,
    DEBUG_PARAM,
  };
}

describe("logger.ts", () => {
  afterEach(() => expect.hasAssertions());
  describe("setLogger", () => {
    const commonLogFn = jest.fn();
    const mockLogger: Logger = {
      log: commonLogFn,
      error: commonLogFn,
      debug: commonLogFn,
      warn: commonLogFn,
    };

    beforeEach(() => {
      commonLogFn.mockReset().mockName("common log mock");
      setLogger(mockLogger);
    });

    it("should set custom logger", () => {
      const { LOG_PARAM, ERROR_PARAM, WARN_PARAM, DEBUG_PARAM } = callAllLogs();
      expect(commonLogFn).toHaveBeenCalledTimes(4);
      expect(commonLogFn).toHaveBeenNthCalledWith(1, LOG_PARAM, LOG_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(2, ERROR_PARAM, ERROR_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(3, WARN_PARAM, WARN_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(4, DEBUG_PARAM, DEBUG_PARAM);
    });

    it("should partially set the debug", () => {
      const debugFn = jest.fn().mockName("debug mock");
      setLogger({ debug: debugFn });

      const { LOG_PARAM, ERROR_PARAM, WARN_PARAM, DEBUG_PARAM } = callAllLogs();

      expect(debugFn).toHaveBeenCalledTimes(1);
      expect(debugFn).toHaveBeenNthCalledWith(1, DEBUG_PARAM, DEBUG_PARAM);
      expect(commonLogFn).toHaveBeenCalledTimes(3);
      expect(commonLogFn).toHaveBeenNthCalledWith(1, LOG_PARAM, LOG_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(2, ERROR_PARAM, ERROR_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(3, WARN_PARAM, WARN_PARAM);
    });

    it("should partially set the log", () => {
      const logFn = jest.fn().mockName("log mock");
      setLogger({ log: logFn });

      const { LOG_PARAM, ERROR_PARAM, WARN_PARAM, DEBUG_PARAM } = callAllLogs();

      expect(logFn).toHaveBeenCalledTimes(1);
      expect(logFn).toHaveBeenNthCalledWith(1, LOG_PARAM, LOG_PARAM);
      expect(commonLogFn).toHaveBeenCalledTimes(3);
      expect(commonLogFn).toHaveBeenNthCalledWith(1, ERROR_PARAM, ERROR_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(2, WARN_PARAM, WARN_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(3, DEBUG_PARAM, DEBUG_PARAM);
    });

    it("should partially set the log", () => {
      const errorFn = jest.fn().mockName("error mock");
      setLogger({ error: errorFn });

      const { LOG_PARAM, ERROR_PARAM, WARN_PARAM, DEBUG_PARAM } = callAllLogs();

      expect(errorFn).toHaveBeenCalledTimes(1);
      expect(errorFn).toHaveBeenNthCalledWith(1, ERROR_PARAM, ERROR_PARAM);
      expect(commonLogFn).toHaveBeenCalledTimes(3);
      expect(commonLogFn).toHaveBeenNthCalledWith(1, LOG_PARAM, LOG_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(2, WARN_PARAM, WARN_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(3, DEBUG_PARAM, DEBUG_PARAM);
    });

    it("should partially set the log", () => {
      const warnFn = jest.fn().mockName("warn mock");
      setLogger({ warn: warnFn });

      const { LOG_PARAM, ERROR_PARAM, WARN_PARAM, DEBUG_PARAM } = callAllLogs();

      expect(warnFn).toHaveBeenCalledTimes(1);
      expect(warnFn).toHaveBeenNthCalledWith(1, WARN_PARAM, WARN_PARAM);
      expect(commonLogFn).toHaveBeenCalledTimes(3);
      expect(commonLogFn).toHaveBeenNthCalledWith(1, LOG_PARAM, LOG_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(2, ERROR_PARAM, ERROR_PARAM);
      expect(commonLogFn).toHaveBeenNthCalledWith(3, DEBUG_PARAM, DEBUG_PARAM);
    });
  });
});
