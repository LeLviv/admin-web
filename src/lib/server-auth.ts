import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "lelviv_admin_token";

export function getBackendUrl(): string {
  return (process.env.BACKEND_URL || "http://127.0.0.1:8080").replace(/\/+$/, "");
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/**
 * Verifies that a JWT token belongs to an ADMIN by probing an admin-protected
 * endpoint, since the backend JWT does not embed role claims.
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/complaints?page=0&size=1`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchUsername(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/userInfo/username`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text || null;
  } catch {
    return null;
  }
}
