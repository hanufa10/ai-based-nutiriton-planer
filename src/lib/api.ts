const API_BASE =
  import.meta.env.DEV
    ? "http://localhost:4001"
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
    throw new Error(await res.text());
  }

  return res.json();
}