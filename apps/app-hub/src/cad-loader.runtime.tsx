import type { ComponentType } from "react";
import { loadRemote, registerRemotes } from "@module-federation/runtime";

// FR-15 (runtime fallback): CAD is NOT in vite `remotes`; it is registered and loaded through the MF runtime API.
// @module-federation/runtime is the same runtime @module-federation/vite uses, so we hit the same instance.
registerRemotes([{ name: "cad", entry: `${import.meta.env.VITE_CAD_URL}/remoteEntry.js`, type: "module" }]);

// FR-16: only the loader lives here; RemoteBoundary in App.tsx does lazy / Suspense / errors.
export default async () => {
  const mod = await loadRemote<{ default: ComponentType }>("cad/App");
  if (!mod) throw new Error("loadRemote('cad/App') returned nothing");
  return mod;
};
