import { proxyToBackend } from "@/lib/proxy";

/**
 * POST /api/auth/register → Proxies to backend POST /auth/register
 * No caching for auth endpoints.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json();

  return proxyToBackend({
    backendPath: "/auth/register",
    request,
    body,
    cacheControl: "no-store",
  });
}
