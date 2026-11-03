// NFR-02: single source of truth for the Module Federation `shared` block — imported by shell, app-hub and cad.
// Versions must match the pinned ones in each app's package.json.
const singleton = (requiredVersion: string) => ({ singleton: true, strictVersion: true, requiredVersion });

export const shared = {
  react: singleton("19.0.0"),
  "react/jsx-runtime": singleton("19.0.0"),
  // used by @vitejs/plugin-react in dev only; without it each remote ships its own copy
  "react/jsx-dev-runtime": singleton("19.0.0"),
  "react-dom": singleton("19.0.0"),
  "react-dom/client": singleton("19.0.0"),
  "react-router-dom": singleton("6.30.4"),
  "@tanstack/react-query": singleton("5.90.2"),
  "@portal/contracts": singleton("0.0.1"),
};
