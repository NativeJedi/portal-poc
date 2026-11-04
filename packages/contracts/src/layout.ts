import { createContext, useContext } from "react";

// FR-05: DOM mount node in the shell header that any descendant can fill via createPortal
export const PORTAL_NODE_ID = "appbar-actions-right";

export type LayoutValue = {
  breadcrumbs: string[];
  setBreadcrumbs: (items: string[]) => void;
};

export const LayoutContext = createContext<LayoutValue | null>(null);

// FR-05: context API for layout extension
export function useLayout(): LayoutValue {
  const value = useContext(LayoutContext);
  if (!value) throw new Error("useLayout must be used inside the shell LayoutProvider");
  return value;
}
