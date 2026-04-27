import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/constants/server";

interface ProxyRequestOptions {
  /** The backend path to proxy to (e.g. "/spaces" or "/notes/abc-123"). */
  backendPath: string;
  /** The incoming Next.js request — used to forward auth headers. */
  request: Request;
  /** HTTP method override. Defaults to the incoming request method. */
  method?: string;
  /** Request body to forward. Only used for POST/PATCH/PUT. */
  body?: unknown;
  /** Cache-Control header value for the response. */
  cacheControl?: string;
  /** Next.js fetch revalidate time in seconds. Set to 0 to bypass server cache. */
  revalidate?: number;
}

/**
 * Proxies a request from a Next.js Route Handler to the backend API.
 *
 * - Forwards the `Authorization` header from the client.
 * - Sets `Cache-Control` on the response for client-side + CDN caching.
 * - Uses Next.js `fetch` `revalidate` for server-side ISR-style caching.
 * - Returns the backend response as-is (encrypted ciphertext passes through).
 */
export async function proxyToBackend({
  backendPath,
  request,
  method,
  body,
  cacheControl = "private, no-cache",
  revalidate = 0,
}: ProxyRequestOptions): Promise<NextResponse> {
  const authHeader = request.headers.get("Authorization");

  const isFormData = body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(authHeader ? { Authorization: authHeader } : {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const fetchInit: RequestInit & { next?: { revalidate: number } } = {
    method: method ?? request.method,
    headers,
    ...(body ? { body: isFormData ? (body as any) : JSON.stringify(body) } : {}),
    next: { revalidate },
  };

  try {
    const backendResponse = await fetch(
      `${BACKEND_BASE_URL}${backendPath}`,
      fetchInit,
    );

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      return NextResponse.json(
        { error: errorBody || `Backend error: ${backendResponse.status}` },
        {
          status: backendResponse.status,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const data: unknown = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: {
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Proxy request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
