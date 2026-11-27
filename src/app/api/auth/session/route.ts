import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  fetchUsername,
  getAuthToken,
  verifyAdminToken,
} from "@/lib/server-auth";

export async function GET() {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const isAdmin = await verifyAdminToken(token);
  if (!isAdmin) {
    const res = NextResponse.json({ authenticated: false }, { status: 403 });
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }

  const username = await fetchUsername(token);
  return NextResponse.json({ authenticated: true, username });
}
