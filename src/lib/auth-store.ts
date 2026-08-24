import type { AppUser } from "@/types/models";

export type AuthState = {
  user: AppUser | null;
  accessToken: string | null;
  refreshToken: string | null;
};

const STORAGE_KEY = "agrirentx.auth";

function isBrowser() {
  return typeof window !== "undefined";
}

function readFromStorage(): AuthState {
  if (!isBrowser()) return { user: null, accessToken: null, refreshToken: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw) as AuthState;
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

let state: AuthState = readFromStorage();
const listeners = new Set<() => void>();

function persist() {
  if (!isBrowser()) return;
  if (state.accessToken && state.user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export const authStore = {
  getState(): AuthState {
    return state;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setSession(next: { user: AppUser; accessToken: string; refreshToken: string }) {
    state = { user: next.user, accessToken: next.accessToken, refreshToken: next.refreshToken };
    persist();
    emit();
  },
  setAccessToken(accessToken: string) {
    state = { ...state, accessToken };
    persist();
    emit();
  },
  setUser(user: AppUser) {
    state = { ...state, user };
    persist();
    emit();
  },
  clear() {
    state = { user: null, accessToken: null, refreshToken: null };
    persist();
    emit();
  },
  /** Re-reads localStorage. Only needed after SSR hydration on first client mount. */
  hydrate() {
    state = readFromStorage();
    emit();
  },
};
