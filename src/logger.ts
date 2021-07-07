/* eslint-disable no-console */
export interface Logger {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

let logger: Logger = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: () => {
    /* ignore by default */
  },
};

export function setLogger(newLogger: Partial<Logger>) {
  logger = {
    log: newLogger.log ?? logger.log,
    error: newLogger.error ?? logger.error,
    warn: newLogger.warn ?? logger.warn,
    debug: newLogger.debug ?? logger.debug,
  };
}

export function log(...args: unknown[]): void {
  logger.log(...args);
}

export function logError(...args: unknown[]): void {
  logger.error(...args);
}

export function logWarn(...args: unknown[]): void {
  logger.warn(...args);
}

export function logDebug(...args: unknown[]): void {
  logger.debug(...args);
}
