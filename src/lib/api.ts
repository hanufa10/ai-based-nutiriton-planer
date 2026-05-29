const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "https://nutiplanner-api-2.onrender.com";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  if (auth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError("Not authenticated", 401);
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const err = data as { message?: string; detail?: string } | null;
    const message =
      err?.message || err?.detail || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
