export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const STORAGE_KEY = "agrirentx.language";
const DEFAULT_LANGUAGE: LanguageCode = "en";

function isBrowser() {
  return typeof window !== "undefined";
}

function isSupported(value: string | null): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((l) => l.code === value);
}

function readFromStorage(): LanguageCode {
  if (!isBrowser()) return DEFAULT_LANGUAGE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isSupported(raw) ? raw : DEFAULT_LANGUAGE;
}

let state: LanguageCode = readFromStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export const languageStore = {
  getState(): LanguageCode {
    return state;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setLanguage(code: LanguageCode) {
    state = code;
    if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, code);
    emit();
  },
};
