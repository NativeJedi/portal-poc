import { useState, type ReactNode } from "react";
import { AuthContext, type User } from "@portal/contracts";

export const FAKE_USERS: User[] = [{ name: "Alice" }, { name: "Bob" }];

// FR-01: fake auth session, owned by the shell; FR-04: setUser lets the header switch users
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(FAKE_USERS[0]);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
