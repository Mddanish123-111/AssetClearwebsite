const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("assetclear_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("assetclear_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("assetclear_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiClientError(res.status, body.error ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; firstName: string; lastName: string; role: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  me: () => request<{ id: string; email: string; firstName: string; lastName: string; role: string }>("/auth/me"),

  listClients: () => request<any[]>("/clients"),
  getClient: (id: string) => request<any>(`/clients/${id}`),
  createClient: (data: any) => request<any>("/clients", { method: "POST", body: JSON.stringify(data) }),

  listJobs: () => request<any[]>("/jobs"),
  getJob: (id: string) => request<any>(`/jobs/${id}`),
  createJob: (data: any) => request<any>("/jobs", { method: "POST", body: JSON.stringify(data) }),
  updateJobStatus: (id: string, status: string, note?: string) =>
    request<any>(`/jobs/${id}/status`, { method: "POST", body: JSON.stringify({ status, note }) }),

  listAssets: (jobId?: string) => request<any[]>(`/assets${jobId ? `?jobId=${jobId}` : ""}`),
  createAsset: (data: any) => request<any>("/assets", { method: "POST", body: JSON.stringify(data) }),
  updateAssetDisposition: (id: string, disposition: string) =>
    request<any>(`/assets/${id}/disposition`, { method: "PATCH", body: JSON.stringify({ disposition }) }),
};

export { ApiClientError };
