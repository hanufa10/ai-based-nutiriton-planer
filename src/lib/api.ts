const API_BASE =
  import.meta.env.DEV
    ? "https://nutiplanner-api-2.onrender.com/user/login"
    : "https://nutiplanner-api-2.onrender.com";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(await res.text(), res.status, await res.json().catch(() => null));
  }

  return res.json();
}
export class ApiError extends Error {
  status: number;
  body?: any;

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}