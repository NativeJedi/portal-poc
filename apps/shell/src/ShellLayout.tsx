import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PORTAL_NODE_ID, useAuth, useLayout } from "@portal/contracts";
import { FAKE_USERS } from "./providers/AuthProvider";

export function ShellLayout({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();
  const { breadcrumbs } = useLayout();

  return (
    <div style={{ border: "4px solid red", padding: 12 }}>
      <header>
        <b>Shell</b> | user: {user.name}{" "}
        {/* FR-04: switch the fake user */}
        {FAKE_USERS.map((u) => (
          <button key={u.name} onClick={() => setUser(u)} disabled={u.name === user.name}>
            {u.name}
          </button>
        ))}
        <nav>
          <Link to="/">Home</Link> | <Link to="/app-hub">App Hub</Link>
        </nav>
        {/* FR-05: breadcrumbs filled by descendants via useLayout().setBreadcrumbs() */}
        <div>Breadcrumbs: {breadcrumbs.join(" / ") || "—"}</div>
        {/* FR-05: DOM mount node for descendants' portals */}
        <div>
          Actions slot: <span id={PORTAL_NODE_ID} />
        </div>
      </header>
      <main style={{ marginTop: 12 }}>{children}</main>
    </div>
  );
}
