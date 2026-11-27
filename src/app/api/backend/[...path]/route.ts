import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getBackendUrl } from "@/lib/server-auth";

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 }
    );
  }

  const { path } = await context.params;
  const targetPath = path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${getBackendUrl()}/${targetPath}${search}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const accept = request.headers.get("accept");
  if (accept) {
    headers.set("Accept", accept);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method.toUpperCase());
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const backendRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const resContentType = backendRes.headers.get("content-type");
    if (resContentType) {
      responseHeaders.set("Content-Type", resContentType);
    }

    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const resBuffer = await backendRes.arrayBuffer();
    return new NextResponse(resBuffer, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to connect to backend service." },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
