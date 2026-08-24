import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { authStore } from "@/lib/auth-store";
import * as authApi from "@/lib/api/auth";
import type { AppUser } from "@/types/models";

type AuthContextValue = {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => Promise<AppUser>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<AppUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    authStore.setSession(res);
    return res.user;
  }, []);

  const register = useCallback(
    async (input: { fullName: string; email: string; phone: string; password: string; confirmPassword: string }) => {
      const res = await authApi.register(input);
      authStore.setSession(res);
      return res.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Already logging out client-side regardless of server response.
    }
    authStore.clear();
  }, []);

  const refetchMe = useCallback(async () => {
    const user = await authApi.getMe();
    authStore.setUser(user);
    return user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: !!state.accessToken && !!state.user,
      login,
      register,
      logout,
      refetchMe,
    }),
    [state.user, state.accessToken, login, register, logout, refetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
