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
    cacheControl: `private, max-age=${PROXY_CACHE_CONFIG.SPACES_LIST_MAX_AGE_S}, stale-while-revalidate=${PROXY_CACHE_CONFIG.STALE_WHILE_REVALIDATE_S}`,
    revalidate: PROXY_CACHE_CONFIG.SPACES_LIST_MAX_AGE_S,
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
