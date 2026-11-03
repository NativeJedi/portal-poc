import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { shared } from "../../mf-shared";

export default defineConfig(({ mode }) => {
  // NFR-05: all origins come from .env
  const envDir = fileURLToPath(new URL("../..", import.meta.url));
  const env = loadEnv(mode, envDir);
  const port = Number(new URL(env.VITE_CAD_URL).port);

  return {
    // NFR-06: absolute base for build, so chunks load from OUR origin, not the host's
    base: `${env.VITE_CAD_URL}/`,
    envDir,
    plugins: [
      react(),
      federation({
        name: "cad",
        filename: "remoteEntry.js",
        // FR-07: App Hub reads ${VITE_CAD_URL}/remoteEntry.js directly (no manifest)
        // FR-09: what App Hub loads as "cad/App"
        exposes: { "./App": "./src/App.tsx" },
        // NFR-02: identical shared block in all three apps (see /mf-shared.ts)
        shared,
      }),
    ],
    // NFR-07: fixed port + CORS, the hosts fetch us cross-origin
    // In dev Vite drops the origin from `base`; the MF plugin uses server.origin for publicPath of remoteEntry.js
    server: { port, strictPort: true, cors: true, origin: env.VITE_CAD_URL },
    preview: { port, strictPort: true, cors: true },
    // NFR-06: top-level await in MF output
    build: { target: "esnext" },
  };
});
