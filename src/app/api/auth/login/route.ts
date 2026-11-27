import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  fetchUsername,
  getBackendUrl,
  verifyAdminToken,
} from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const authRes = await fetch(`${getBackendUrl()}/api/v1/auth/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!authRes.ok) {
      const errorData = await authRes.json().catch(() => null);
      const message =
        errorData?.detail ||
        errorData?.message ||
        "Invalid email or password.";
      return NextResponse.json(
        { message },
        { status: authRes.status === 403 || authRes.status === 401 ? 401 : authRes.status }
      );
    }

    const data = (await authRes.json()) as { token?: string };
    if (!data?.token) {
      return NextResponse.json(
        { message: "Authentication response did not contain a token." },
        { status: 502 }
      );
    }

    const isAdmin = await verifyAdminToken(data.token);
    if (!isAdmin) {
      return NextResponse.json(
        { message: "Access denied. Administrator privileges are required." },
        { status: 403 }
      );
    }

    const username = await fetchUsername(data.token);

    const response = NextResponse.json({
      ok: true,
      email,
      username,
    });

    response.cookies.set(AUTH_COOKIE_NAME, data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // Matches backend 24h JWT expiration
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the backend server." },
      { status: 502 }
    );
  }
}
