// FR-16: decides what the single "retry" button does for a given error.
//
// Why a load failure always needs a page reload with static `remotes`:
// `import("cad/App")` resolves to a virtual module from @module-federation/vite that does
// `await loadRemote("cad/App")` at top level. When that rejects, two caches keep the failure:
//   1. the browser module map caches the module's evaluation error, so `import()` of it rejects again;
//   2. the MF runtime keeps the rejected remoteEntry promise in `globalLoading` and never clears it.
// Neither can be reset from app code, so remounting cannot fix it. Only a fresh document can.
export type Recovery = "remount" | "reload-page";

/** A render error that comes back within this window after a remount is treated as permanent. */
export const REPEAT_WINDOW_MS = 10_000;

/** Thrown by RemoteBoundary when the remote module itself (remoteEntry, exposed chunk, shared deps) fails to load. */
export class RemoteLoadError extends Error {
  constructor(
    readonly remote: string,
    cause: unknown,
  ) {
    super(`Failed to load remote "${remote}"`, { cause });
    this.name = "RemoteLoadError";
  }
}

const CHUNK_LOAD_PATTERNS = [
  /Failed to fetch dynamically imported module/i, // Chromium
  /error loading dynamically imported module/i, // Firefox
  /Importing a module script failed/i, // Safari
  /RUNTIME-\d{3}/, // MF runtime error codes (remoteEntry / script load / shared resolution)
  /Federation Runtime/,
];

function causes(error: unknown): unknown[] {
  const chain: unknown[] = [];
  for (let e = error; e != null && chain.length < 10; e = (e as { cause?: unknown }).cause) chain.push(e);
  return chain;
}

/**
 * True when the code itself could not be loaded, as opposed to loaded code throwing.
 * Covers the remote's own load and lazy chunks inside an already loaded remote (e.g. stale hashes after a redeploy).
 */
export function isLoadError(error: unknown): boolean {
  return causes(error).some(
    (e) =>
      e instanceof RemoteLoadError ||
      (e instanceof Error && (e.name === "ChunkLoadError" || CHUNK_LOAD_PATTERNS.some((re) => re.test(e.message)))),
  );
}

export function pickRecovery(error: unknown, failedAt: number, lastRemountAt?: number): Recovery {
  if (isLoadError(error)) return "reload-page";
  // a remount already happened and the remote crashed again right away: stop remounting, reset the whole page
  if (lastRemountAt !== undefined && failedAt - lastRemountAt < REPEAT_WINDOW_MS) return "reload-page";
  return "remount";
}
