import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { shared } from "../../mf-shared";

export default defineConfig(({ mode }) => {
  // NFR-05: all origins come from .env
  const envDir = fileURLToPath(new URL("../..", import.meta.url));
  const env = loadEnv(mode, envDir);
  const port = Number(new URL(env.VITE_SHELL_URL).port);

  return {
    envDir,
    plugins: [
      react(),
      federation({
        name: "shell",
        // FR-03 / NFR-03: shell knows ONLY appHub. Anything nested below it is App Hub's business.
        remotes: {
          appHub: {
            type: "module",
            name: "appHub",
            entry: `${env.VITE_APP_HUB_URL}/remoteEntry.js`,
          },
        },
        // remoteEntry of a remote is fetched on first use, not at startup (default "version-first" preloads all remotes)
        shareStrategy: "loaded-first",
        // NFR-02: identical shared block in all three apps (see /mf-shared.ts)
        shared,
      }),
    ],
    // NFR-07: fixed port, no drift
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
    // NFR-06: top-level await in MF output
    build: { target: "esnext" },
  };
});
