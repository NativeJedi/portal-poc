import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { AuthProvider } from "./providers/AuthProvider";
import { LayoutProvider } from "./providers/LayoutProvider";
import { ShellLayout } from "./ShellLayout";
import { RemoteBoundary } from "@portal/remote-boundary";
import "./diagnostics";

// FR-02 / FR-06: App Hub is loaded from the remote
const loadAppHub = () => import("appHub/App");

export function App() {
  // FR-01: all providers mounted once, at the root. Remotes create none of their own.
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LayoutProvider>
            <ShellLayout>
              <Routes>
                <Route path="/" element={<p>Home (shell)</p>} />
                {/* FR-02: everything under /app-hub belongs to App Hub. FR-16: its failure keeps the shell alive */}
                <Route
                  path="/app-hub/*"
                  element={<RemoteBoundary name="appHub/App" load={loadAppHub} fallback={<p>Loading App Hub…</p>} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ShellLayout>
          </LayoutProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
