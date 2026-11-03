# Spike result: Nested Module Federation (shell → App Hub → CAD)

Requirements: [requirements.md](requirements.md)

## Result

| Field | Value |
|---|---|
| Outcome | **works** |
| Approach | Static `remotes` in App Hub. The `loadRemote` fallback also works. Context registry (FR-14) is used; contracts are also MF-shared as a singleton. |
| Problems found | See below |
| Date / versions tested | 2026-11-03. vite 5.4.21, @module-federation/vite 1.7.2 (runtime 0.17.1), react / react-dom 19.0.0, react-router-dom 6.30.4, @tanstack/react-query 5.90.2, pnpm 12.15.0, Node 24.5.0 |

## Acceptance matrix

Checked in the browser for both loaders (`VITE_CAD_LOADER=static` and `runtime`).

| AC | Criterion | Dev (static / runtime) | Build/preview (static / runtime) |
|---|---|---|---|
| AC-1 | CAD renders inside App Hub inside shell at `/app-hub/cad` | ✅ / ✅ | ✅ / ✅ |
| AC-2 | `window.__shellReact === React` in CAD | ✅ / ✅ | ✅ / ✅ |
| AC-3 | `useQueryClient()` in CAD is the shell's instance | ✅ / ✅ | ✅ / ✅ |
| AC-4 | `useAuth()` in CAD follows the user switch in shell | ✅ / ✅ | ✅ / ✅ |
| AC-5 | Navigation inside CAD and Back/Forward across shell / App Hub / CAD | ✅ / ✅ | ✅ / ✅ |
| AC-6 | Breadcrumbs and portal show up in the shell, and are removed on unmount | ✅ / ✅ | ✅ / ✅ |
| AC-7 | Only one copy of react / react-dom / router / query is downloaded | ✅ / ✅ (after fix 2) | ✅ / ✅ |
| AC-8 | Fallback loader (`loadRemote`) | ✅ | ✅ |

What the network showed for AC-7: the library chunks load only from 5170. From 5174 and 5175 the page loads `mf-manifest.json`, `remoteEntry.js`, `App-*.js` and small `*__loadShare__*` proxy modules. There are no library copies.

Other checks:

| Check | Result |
|---|---|
| FR-03 `grep -ri cad apps/shell` (excluding node_modules/dist) | no matches |
| NFR-01 single version via `pnpm why`, no `^`/`~` | ✅ |
| NFR-02 `shared` blocks diffed shell vs app-hub vs cad | identical |
| NFR-09 CAD `react` requiredVersion set to `19.0.1` | Loud error: `Version 19.0.0 from shell of shared singleton module react does not satisfy the requirement of cad which needs 19.0.1`. No second copy is loaded. |

## Problems found and fixes

1. **The dev manifest gives a relative `publicPath`.** In `vite dev`, Vite drops the origin from an absolute `base`, so `mf-manifest.json` had `publicPath: "/"`. The shell then asked for `http://localhost:5170/remoteEntry.js` and got a 404. **Fix:** set `server.origin` to the remote's own URL. The plugin builds `publicPath` from `server.origin + base`. See `apps/*/vite.config.ts` (NFR-06).
2. **`react/jsx-dev-runtime` is a separate subpath in dev.** @vitejs/plugin-react uses `jsx-dev-runtime` in dev and `jsx-runtime` in build. Without sharing it, each remote downloaded its own copy (~24KB) in dev. **Fix:** add it to `shared` in all three configs (NFR-02).
3. **A failed shared negotiation blanks the whole shell.** With a strictVersion mismatch (NFR-09), the error is thrown while the remote loads. Since there is no error boundary, the shell UI is gone too. For production: wrap every remote mount in an error boundary.
4. **Stale dependency cache after a `shared` change in dev.** After editing `shared`, the browser sometimes kept old optimized-deps chunks, and the page loaded the remote from the wrong origin. A clean restart (delete `node_modules/.vite` and `.__mf__temp`) fixes it.
5. **The runtime loader needs `@module-federation/runtime`, not `@module-federation/enhanced`.** App Hub pins `@module-federation/runtime` 0.17.1, the version the vite plugin uses. `registerRemotes` / `loadRemote` hit the plugin's runtime instance.
6. The React Router v7 future-flag warnings (`v7_startTransition`, `v7_relativeSplatPath`) are expected on 6.30.x. They should be addressed before moving to v7, because nested `*` routes rely on relative resolution.
