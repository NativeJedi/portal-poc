import { useContext } from "react";
import { getOrCreateContext } from "./registry";

export type User = { name: string };

export type AuthValue = {
  user: User;
  setUser: (user: User) => void;
};

// FR-14: created through the global registry
export const AuthContext = getOrCreateContext<AuthValue | null>("auth", null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside the shell AuthProvider");
  return value;
}
