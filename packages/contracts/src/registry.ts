import { createContext, type Context } from "react";

// FR-14: shared contexts live in a global registry keyed by Symbol.for(...).
// If this module is ever bundled more than once (e.g. MF sharing fails),
// every copy still resolves to the SAME context object, so CAD reads the shell's providers.
export function getOrCreateContext<T>(name: string, defaultValue: T): Context<T> {
  const key = Symbol.for(`shell.${name}.context`);
  const registry = globalThis as unknown as Record<symbol, Context<T> | undefined>;
  return (registry[key] ??= createContext<T>(defaultValue));
}
