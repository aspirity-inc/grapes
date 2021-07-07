declare const b: unique symbol;
export type Grape<T> = string & { [b]: T };

let i = 0;
export function createGrape<T>(name: string): Grape<T> {
  i += 1;
  return `${name}[${i}]` as Grape<T>;
}
