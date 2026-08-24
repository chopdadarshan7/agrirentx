import { authStore } from "@/lib/auth-store";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export type FieldError = { path: string; message: string };

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldError[];

  constructor(status: number, message: string, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Skip the Authorization header (used only by the refresh call itself). */
  skipAuth?: boolean;
};

async function parseErrorBody(res: Response): Promise<ApiError> {
  let payload: { message?: string; errors?: { msg?: string; message?: string; path?: string; param?: string }[] } = {};
  try {
    payload = await res.json();
  } catch {
    // no JSON body
  }

  const fieldErrors: FieldError[] = (payload.errors ?? []).map((e) => ({
    path: e.path ?? e.param ?? "",
    message: e.msg ?? e.message ?? "Invalid value",
  }));

  const message = payload.message ?? fieldErrors[0]?.message ?? "Something went wrong. Please try again.";

  return new ApiError(res.status, message, fieldErrors);
}

function buildBody(body: unknown): { init: BodyInit | undefined; contentType: string | undefined } {
  if (body === undefined) return { init: undefined, contentType: undefined };
  if (body instanceof FormData) return { init: body, contentType: undefined };
  return { init: JSON.stringify(body), contentType: "application/json" };
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = authStore.getState();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { accessToken?: string };
        return data.accessToken ?? null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function hardLogout() {
  authStore.clear();
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, skipAuth = false } = options;
  const { init, contentType } = buildBody(body);

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (contentType) headers["Content-Type"] = contentType;
    if (!skipAuth) {
      const { accessToken } = authStore.getState();
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const fetchInit: RequestInit = { method, headers };
    if (init !== undefined) fetchInit.body = init;
    return fetch(`${API_URL}${path}`, fetchInit);
  };

  let res = await doFetch();

  if (res.status === 401 && !skipAuth) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      authStore.setAccessToken(newAccessToken);
      res = await doFetch();
    } else {
      hardLogout();
      throw new ApiError(401, "Your session has expired. Please log in again.");
    }
  }

  if (res.status === 403) {
    const probe = await parseErrorBody(res.clone());
    if (probe.message.toLowerCase().includes("blocked")) {
      hardLogout();
      throw probe;
    }
  }

  if (!res.ok) {
    throw await parseErrorBody(res);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
