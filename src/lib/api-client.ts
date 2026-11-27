export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const res = await fetch(`/api/backend/${normalizedPath}`, {
    ...options,
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    const text = await res.text().catch(() => "");
    if (text) {
      try {
        const json = JSON.parse(text);
        if (json?.errors && typeof json.errors === "object") {
          const firstError = Object.values(json.errors)[0];
          if (typeof firstError === "string") {
            message = firstError;
          }
        } else {
          message = json?.detail || json?.message || json?.title || message;
        }
      } catch {
        message = text;
      }
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204 || res.status === 202) {
    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}
