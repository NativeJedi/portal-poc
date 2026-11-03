import { useState, type ReactNode } from "react";
import { LayoutContext } from "@portal/contracts";

// FR-01 / FR-05: layout extension point (context API part)
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  return (
    <LayoutContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>{children}</LayoutContext.Provider>
  );
}
