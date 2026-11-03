import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { shared } from "../../mf-shared";

export default defineConfig(({ mode }) => {
  // NFR-05: all origins come from .env
  const envDir = fileURLToPath(new URL("../..", import.meta.url));
  const env = loadEnv(mode, envDir);
  const port = Number(new URL(env.VITE_APP_HUB_URL).port);
  // FR-15: static = classic vite `remotes`, runtime = registerRemotes + loadRemote (see src/cad-loader.*.tsx)
  const cadLoader = env.VITE_CAD_LOADER === "runtime" ? "runtime" : "static";

  return {
    // NFR-06: absolute base for build, so chunks load from OUR origin, not the host's
    base: `${env.VITE_APP_HUB_URL}/`,
    resolve: {
      // FR-15: pick the CAD loader at build time; the other one is never compiled
      alias: { "@/cad-loader": path.resolve(__dirname, `src/cad-loader.${cadLoader}.tsx`) },
    },
    envDir,
    plugins: [
      react(),
      federation({
        name: "appHub",
        filename: "remoteEntry.js",
        // FR-06: what the shell loads as "appHub/App"
        exposes: { "./App": "./src/App.tsx" },
        // FR-07: App Hub is the host for CAD. In runtime mode it is registered in code instead (FR-15).
        remotes:
          cadLoader === "static"
            ? { cad: { type: "module", name: "cad", entry: `${env.VITE_CAD_URL}/remoteEntry.js` } }
            : {},
        // remoteEntry of a remote is fetched on first use, not at startup (default "version-first" preloads all remotes)
        shareStrategy: "loaded-first",
        // NFR-02: identical shared block in all three apps (see /mf-shared.ts)
        shared,
      }),
    ],
    // NFR-07: fixed port + CORS, the host fetches us cross-origin
    // In dev Vite drops the origin from `base`; the MF plugin uses server.origin for publicPath of remoteEntry.js
    server: { port, strictPort: true, cors: true, origin: env.VITE_APP_HUB_URL },
    preview: { port, strictPort: true, cors: true },
    // NFR-06: top-level await in MF output
    build: { target: "esnext" },
  };
});
