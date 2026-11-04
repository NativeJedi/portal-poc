import { createContext, useContext } from "react";

export type User = { name: string };

export type AuthValue = {
  user: User;
  setUser: (user: User) => void;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside the shell AuthProvider");
  return value;
}
