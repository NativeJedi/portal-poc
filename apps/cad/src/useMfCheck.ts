import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInRouterContext } from "react-router-dom";
import { useAuth } from "@portal/contracts";

type ShellGlobals = Window & { __shellReact?: unknown; __shellQueryClient?: unknown };

// NFR-10: same flag as in the shell
const mfDebug = import.meta.env.DEV || import.meta.env.VITE_MF_DEBUG === "true";

// FR-13: prove CAD runs on the shell's singletons
export function useMfCheck() {
  const queryClient = useQueryClient();
  const inRouter = useInRouterContext();
  const { user } = useAuth();

  useEffect(() => {
    if (!mfDebug) return;
    const w = window as ShellGlobals;
    console.log("[mf-check] cad: window.__shellReact === React ->", w.__shellReact === React);
    console.log("[mf-check] cad: useQueryClient() === window.__shellQueryClient ->", queryClient === w.__shellQueryClient);
    console.log("[mf-check] cad: useInRouterContext() ->", inRouter);
    console.log("[mf-check] cad: useAuth().user ->", user.name);
  }, [queryClient, inRouter, user]);
}
