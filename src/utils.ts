export type AnyFnArgument = any; // eslint-disable-line @typescript-eslint/no-explicit-any
export type ValueOrGetter<T> = T | (() => T);
export type Undef<T> = T | undefined;
export type Setter<T> = (prev: Undef<T>) => T;

export function getValue<T>(vg: ValueOrGetter<T>): T {
  if (typeof vg === "function") {
    return (vg as () => T)();
  }
  return vg;
}
