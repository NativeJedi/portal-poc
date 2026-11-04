// NFR-10: dev-only diagnostic. Counts how many copies of this package were evaluated on the page.
// It is NOT used to share contexts; it only reports. One copy -> count 1, a second copy -> error log.
const env = (import.meta as unknown as { env?: { DEV?: boolean; VITE_MF_DEBUG?: string } }).env;
const mfDebug = env?.DEV || env?.VITE_MF_DEBUG === "true";

if (mfDebug) {
  const w = window as unknown as { __portalContractsLoads?: number };
  const count = (w.__portalContractsLoads = (w.__portalContractsLoads ?? 0) + 1);
  if (count === 1) {
    console.log("[mf-check] @portal/contracts loaded once (single instance)");
  } else {
    console.error(`[mf-check] @portal/contracts loaded twice (copies: ${count})`);
  }
}

export {};
