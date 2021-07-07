import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Grape } from "./grape";
import { GrapesBunch, createGrapesBunch } from "./grapesBunch";
import { getValue, Setter, ValueOrGetter } from "./utils";

const NO_GRAPE = Symbol("NO_GRAPE") as unknown;
function ensureGrape<T>(
  bunch: GrapesBunch,
  grape: Grape<T>,
  valueToSet: ValueOrGetter<T>
): T {
  const value = bunch.get(grape, NO_GRAPE);
  // default value NO_GRAPE will be returned only the bunch
  // does not contain the grape. in this case we should set value,
  // otherwise just return what we got from the bunch
  if (value !== NO_GRAPE) {
    return value as T;
  }
  const v = getValue(valueToSet);
  bunch.set(grape, v);
  return v;
}

const GrapesBunchContext = createContext<GrapesBunch>(createGrapesBunch());
export const GrapesBunchProvider = GrapesBunchContext.Provider;

export function useGrape<T>(
  grape: Grape<T>,
  defaultValue: ValueOrGetter<T>
): [T, Dispatch<SetStateAction<T>>] {
  const bunch = useContext(GrapesBunchContext);
  const [value, setValue] = useState(() =>
    ensureGrape(bunch, grape, defaultValue)
  );
  const latestDefaultValue = useRef(defaultValue);
  latestDefaultValue.current = defaultValue;
  const set = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      const nextValue =
        typeof next === "function"
          ? (next as Setter<T>)(bunch.get(grape))
          : next;
      bunch.set(grape, nextValue);
    },
    [bunch, grape]
  );
  useEffect(() => {
    const unsubscribe = bunch.on(grape, setValue);
    const currentValue = ensureGrape(bunch, grape, latestDefaultValue.current);
    setValue(currentValue);
    return unsubscribe;
  }, [bunch, grape]);

  return [value, set];
}
