import React from "react";
import { queryClient } from "./queryClient";

declare global {
  interface Window {
    __shellReact?: typeof React;
    __shellQueryClient?: typeof queryClient;
  }
}

// FR-12 / NFR-10: expose shell singletons so remotes can compare identity ([mf-check] logs)
export const mfDebug = import.meta.env.DEV || import.meta.env.VITE_MF_DEBUG === "true";

if (mfDebug) {
  window.__shellReact = React;
  window.__shellQueryClient = queryClient;
  console.log("[mf-check] shell: diagnostics globals set");
}
