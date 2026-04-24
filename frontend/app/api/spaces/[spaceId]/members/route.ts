import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";
import { PROXY_CACHE_CONFIG } from "@/constants/server";

interface RouteContext {
  params: Promise<{ spaceId: string }>;
}

/**
 * GET /api/spaces/[spaceId]/members → Proxies to backend GET /spaces/:spaceId/members
 *
 * Returns space member list. Medium cache since this changes infrequently.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { spaceId } = await context.params;

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/members`,
    request,
    cacheControl: `private, max-age=${PROXY_CACHE_CONFIG.SPACE_MEMBERS_MAX_AGE_S}, stale-while-revalidate=${PROXY_CACHE_CONFIG.STALE_WHILE_REVALIDATE_S}`,
    revalidate: PROXY_CACHE_CONFIG.SPACE_MEMBERS_MAX_AGE_S,
  });
}

/**
 * POST /api/spaces/[spaceId]/members → Proxies to backend POST /spaces/:spaceId/members
 *
 * Adds a member to a space. No caching.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { spaceId } = await context.params;
  const body: unknown = await request.json();

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/members`,
    request,
    body,
    cacheControl: "no-store",
  });
}
