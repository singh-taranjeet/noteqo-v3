import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";
import { PROXY_CACHE_CONFIG } from "@/constants/server";

interface RouteContext {
  params: Promise<{ spaceId: string }>;
}

/**
 * GET /api/spaces/[spaceId]/notes → Proxies to backend GET /spaces/:spaceId/notes
 *
 * Returns the encrypted notes for a space. Short cache since notes change frequently.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { spaceId } = await context.params;

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/notes`,
    request,
    cacheControl: `private, max-age=${PROXY_CACHE_CONFIG.NOTES_LIST_MAX_AGE_S}, stale-while-revalidate=${PROXY_CACHE_CONFIG.STALE_WHILE_REVALIDATE_S}`,
    revalidate: PROXY_CACHE_CONFIG.NOTES_LIST_MAX_AGE_S,
  });
}

/**
 * POST /api/spaces/[spaceId]/notes → Proxies to backend POST /spaces/:spaceId/notes
 *
 * Creates an encrypted note in the space. No caching.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { spaceId } = await context.params;
  const body: unknown = await request.json();

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/notes`,
    request,
    body,
    cacheControl: "no-store",
  });
}
