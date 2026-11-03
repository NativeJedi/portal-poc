// NFR-12: no federated types, just ambient declarations
declare module "cad/App" {
  const App: React.ComponentType;
  export default App;
}

// FR-15: resolved by vite alias to cad-loader.static.tsx or cad-loader.runtime.tsx
declare module "@/cad-loader" {
  const loadCad: () => Promise<{ default: React.ComponentType }>;
  export default loadCad;
}
