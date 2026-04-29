import { proxyToBackend } from "@/lib/proxy";
import { PROXY_CACHE_CONFIG } from "@/constants/server";

/**
 * GET /api/spaces → Proxies to backend GET /spaces
 *
 * Returns the user's encrypted spaces list. Caches for a short period
 * since space metadata changes infrequently.
 */
export async function GET(request: Request) {
  return proxyToBackend({
    backendPath: "/spaces",
    request,
    cacheControl: "no-store",
  });
}

/**
 * POST /api/spaces → Proxies to backend POST /spaces
 *
 * Creates a new space. No caching — always fresh.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json();
  return proxyToBackend({
    backendPath: "/spaces",
    request,
    body,
    cacheControl: "no-store",
  });
}
