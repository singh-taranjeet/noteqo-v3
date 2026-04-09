import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";

interface RouteContext {
  params: Promise<{ spaceId: string; userId: string }>;
}

/**
 * DELETE /api/spaces/[spaceId]/members/[userId]
 * → Proxies to backend DELETE /spaces/:spaceId/members/:userId
 *
 * Removes a member from a space. No caching.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { spaceId, userId } = await context.params;

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/members/${userId}`,
    request,
    cacheControl: "no-store",
  });
}
