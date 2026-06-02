/** Remote API only — set VITE_API_BASE_URL in .env (restart dev server after changes). */
export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "https://nutiplanner-api-2.onrender.com"
).replace(/\/$/, "");

export const AUTH_TOKEN_KEY = "auth_token";
export const USER_PROFILE_KEY = "user_profile";

export type AuthUser = {
  userId: number;
  username?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type ApiFetchConfig = {
  skipAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getAuthToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>(
    "/user/login",
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    },
    { skipAuth: true }
  );
  setAuth(data.token, data.user);
  return data;
}

export type SignUpPayload = {
  username: string;
  email: string;
  password: string;
  role?: string;
};

export async function signUp(payload: SignUpPayload) {
  const data = await apiFetch<LoginResponse & { user: AuthUser }>(
    "/user/create",
    {
      method: "POST",
      body: JSON.stringify({
        username: payload.username,
        email: payload.email,
        password: payload.password,
        role: payload.role ?? "user",
      }),
    },
    { skipAuth: true }
  );
  if (data.token) {
    setAuth(data.token, data.user);
  }
  return data;
}

async function parseErrorMessage(res: Response): Promise<{ message: string; body: unknown }> {
  const text = await res.text();
  if (!text) {
    return { message: res.statusText || `Request failed (${res.status})`, body: undefined };
  }

  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    const message = parsed.message ?? parsed.error ?? text;
    return { message, body: parsed };
  } catch {
    return { message: text, body: text };
  }
}

function handleAuthFailure(status: number, message: string) {
  const isAuthError =
    status === 401 ||
    status === 403;

  if (!isAuthError) return;

  // ONLY redirect if we are sure the token is actually bad
  // or if the server explicitly told us the session expired.
  console.warn("Auth failure detected, clearing session.");
  clearAuth();
  
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  config: ApiFetchConfig = {}
): Promise<T> {
  const token = config.skipAuth ? null : getAuthToken();
  const fullUrl = `${API_BASE}${url}`;

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    throw err;
  }

  if (!res.ok) {
    const { message, body } = await parseErrorMessage(res);
    if (!config.skipAuth) {
      handleAuthFailure(res.status, message);
    }
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
