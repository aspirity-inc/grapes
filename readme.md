# Grapes
[![Version](https://img.shields.io/npm/v/@aspirity/grapes.svg?style=flat-square&)](https://www.npmjs.com/package/@aspirity/grapes?activeTab=versions)
[![Last commit](https://img.shields.io/github/last-commit/aspirity-ru/grapes.svg?style=flat-square&)](https://github.com/aspirity-ru/grapes/graphs/commit-activity)
[![License](https://img.shields.io/github/license/aspirity-ru/grapes.svg?style=flat-square&)](https://github.com/aspirity-ru/grapes/blob/main/LICENSE)

> Granular global state hook for react

## Installation

```bash
npm install @aspirity/grapes
```

## Usage

[Demo on sandbox](https://codesandbox.io/s/grapes-state-y1dee?file=/src/App.tsx)

```typescript
// in countGrape.ts
import { createGrape } from "@aspirity/grapes";
export const countGrape = createGrape<number>("count");

// in Counter.tsx
import { useGrape } from "@aspirity/grapes";
import { countGrape } from "./countGrape";

export function Counter() {
  const [count, setCount] = useGrape(countGrape, 1);
  const increment = () => {
    setCount(count + 1);
  };
  return (
    <button onClick={increment}>
      Click to increment
    </button>
  );
}

// in CounterViewer.tsx
import { useGrape } from "@aspirity/grapes";
import { countGrape } from "./countGrape";

export function CounterViewer() {
  const [count] = useGrape(countGrape, 1);
  return (
    <div>
      Clicked {count} times
    </div>
  );
}
```

## Using with `Provider`

You can use `grapes` without any setup setup code. `useGrapes` will use default store.
But in some cases you may want to pre-configure store on app start, or for testing.
In this case you can create the bunch instance and provide it via `GrapesBunchProvider`.
With this scenario you are able to set a custom cleanup timeout.

```typescript
import { createGrapesBunch, GrapesBunchProvider } from "@aspirity/grapes";
//...

const myBunch = createGrapesBunch({ cleanupTimeoutMs: 10_000 });
myBunch.set(someGrape, new Date())
//...

<GrapesBunchProvider value={myBunch}>
  //...
</GrapesBunchProvider>

```
