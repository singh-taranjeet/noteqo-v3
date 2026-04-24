import { proxyToBackend } from "@/lib/proxy";

/**
 * POST /api/auth/login → Proxies to backend POST /auth/login
 * No caching for auth endpoints.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json();

  return proxyToBackend({
    backendPath: "/auth/login",
    request,
    body,
    cacheControl: "no-store",
  });
}
