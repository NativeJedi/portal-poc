import { Link, Route, Routes } from "react-router-dom";
import { RemoteBoundary } from "@portal/remote-boundary";
import loadCad from "@/cad-loader";

// FR-06: exposed as "./App". FR-08: NO Router here — relative <Routes> under the shell's /app-hub/*
export default function App() {
  return (
    <div style={{ border: "4px solid gold", padding: 12 }}>
      <b>App Hub</b>
      <Routes>
        {/* rApp catalogue (overview.md: currently one card) */}
        <Route index element={<p><Link to="cad">Cell Anomaly Detector 5G</Link></p>} />
        {/* FR-08: relative route, resolves to /app-hub/cad/*. FR-16: a CAD failure stays inside App Hub */}
        <Route
          path="cad/*"
          element={<RemoteBoundary name="cad/App" load={loadCad} fallback={<p>Loading CAD…</p>} />}
        />
      </Routes>
    </div>
  );
}
