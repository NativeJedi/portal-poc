// FR-08 / FR-15 (static): CAD declared in vite `remotes`, imported like a normal module.
// FR-16: only the loader lives here; RemoteBoundary in App.tsx does lazy / Suspense / errors.
export default () => import("cad/App");
