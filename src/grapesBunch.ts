import type { Grape } from "./grape";
import { logDebug, logError } from "./logger";
import { getValue, AnyFnArgument, Undef, ValueOrGetter } from "./utils";

const DEFAULT_CLEANUP_TIMEOUT = 2000;

export type GrapesBunchOptions = {
  cleanupTimeoutMs?: number;
};

export class GrapesBunch {
  _cleanupTimeoutMs: number;

  _grapes = new Map<string, unknown>();

  _subscribers = new Map<string, Set<(v: AnyFnArgument) => void>>();

  _cleanupTimeouts = new Map<string, number>();

  constructor(options?: GrapesBunchOptions) {
    const { cleanupTimeoutMs = DEFAULT_CLEANUP_TIMEOUT } = options ?? {};
    this._cleanupTimeoutMs = cleanupTimeoutMs;
  }

  _notify = <T>(grape: Grape<T>): void => {
    const subscribersSet = this._subscribers.get(grape) ?? new Set();
    const subscribers = [...subscribersSet];
    const value = this.get(grape);
    logDebug("notify", grape, { value, subscribers: subscribers.length });

    subscribers.forEach((fn) => {
      try {
        fn(value);
      } catch (error) {
        logError(`Error in '${grape}' subscriber`, error);
      }
    });
  };

  _off = <T>(grape: Grape<T>, callback: (newValue: T) => void): void => {
    logDebug("unsubscribe", grape);
    const hasSubscribers = this._subscribers.has(grape);
    if (!hasSubscribers) {
      return;
    }
    const subscribersSet = this._subscribers.get(grape) ?? new Set();
    subscribersSet.delete(callback);
    this._checkCleanup(grape);
  };

  _checkCleanup = <T>(grape: Grape<T>): void => {
    const subscribersCount = this._subscribers.get(grape)?.size ?? 0;
    const isCleanupScheduled = this._cleanupTimeouts.has(grape);
    logDebug("checkCleanup", grape, { subscribersCount, isCleanupScheduled });

    if (subscribersCount === 0 && !isCleanupScheduled) {
      const timeoutId = setTimeout(
        () => this._cleanup(grape),
        this._cleanupTimeoutMs
      );
      this._cleanupTimeouts.set(grape, timeoutId);
      logDebug("cleanup scheduled", grape);
    } else if (subscribersCount !== 0 && isCleanupScheduled) {
      const timeoutId = this._cleanupTimeouts.get(grape);
      this._cleanupTimeouts.delete(grape);
      clearTimeout(timeoutId);
      logDebug("cleanup canceled", grape);
    }
  };

  _cleanup = <T>(grape: Grape<T>): void => {
    logDebug("cleanup", grape);
    clearTimeout(this._cleanupTimeouts.get(grape));
    this._grapes.delete(grape);
    this._subscribers.delete(grape);
    this._cleanupTimeouts.delete(grape);
  };

  get<T>(grape: Grape<T>): Undef<T>;
  get<T>(grape: Grape<T>, defaultValue: ValueOrGetter<T>): T;
  get<T>(grape: Grape<T>, defaultValue?: ValueOrGetter<T>): Undef<T> {
    const grapeValue = this._grapes.has(grape)
      ? this._grapes.get(grape)
      : getValue(defaultValue);
    return grapeValue as Undef<T>;
  }

  set<T>(grape: Grape<T>, value: T): void {
    const hasGrape = this._grapes.has(grape);
    const oldGrape = this._grapes.get(grape);
    const skipUpdate = hasGrape && Object.is(oldGrape, value);
    logDebug("set", grape, { value, hasGrape, oldGrape });

    if (skipUpdate) {
      return;
    }

    this._grapes.set(grape, value);
    this._notify(grape);
  }

  on<T>(grape: Grape<T>, callback: (newValue: T) => void): () => void {
    logDebug("subscribe", grape);
    const hasSubscribers = this._subscribers.has(grape);

    if (!hasSubscribers) {
      this._subscribers.set(grape, new Set());
    }

    const subscribersSet = this._subscribers.get(grape)!;
    subscribersSet.add(callback);
    this._checkCleanup(grape);

    return () => this._off(grape, callback);
  }
}

export function createGrapesBunch(options?: GrapesBunchOptions): GrapesBunch {
  return new GrapesBunch(options);
}
