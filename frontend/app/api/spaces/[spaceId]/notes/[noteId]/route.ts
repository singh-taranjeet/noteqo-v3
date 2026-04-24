import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";
import { PROXY_CACHE_CONFIG } from "@/constants/server";

interface RouteContext {
  params: Promise<{ spaceId: string; noteId: string }>;
}

/**
 * GET /api/spaces/[spaceId]/notes/[noteId]
 * → Proxies to backend GET /spaces/:spaceId/notes/:noteId
 *
 * Returns a single encrypted note. Very short cache.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { spaceId, noteId } = await context.params;

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/notes/${noteId}`,
    request,
    cacheControl: `private, max-age=${PROXY_CACHE_CONFIG.NOTE_DETAIL_MAX_AGE_S}, stale-while-revalidate=${PROXY_CACHE_CONFIG.STALE_WHILE_REVALIDATE_S}`,
    revalidate: PROXY_CACHE_CONFIG.NOTE_DETAIL_MAX_AGE_S,
  });
}

/**
 * PATCH /api/spaces/[spaceId]/notes/[noteId]
 * → Proxies to backend PATCH /spaces/:spaceId/notes/:noteId
 *
 * Updates an encrypted note. No caching.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { spaceId, noteId } = await context.params;
  const body: unknown = await request.json();

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/notes/${noteId}`,
    request,
    body,
    cacheControl: "no-store",
  });
}

/**
 * DELETE /api/spaces/[spaceId]/notes/[noteId]
 * → Proxies to backend DELETE /spaces/:spaceId/notes/:noteId
 *
 * Deletes a note. No caching.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { spaceId, noteId } = await context.params;

  return proxyToBackend({
    backendPath: `/spaces/${spaceId}/notes/${noteId}`,
    request,
    cacheControl: "no-store",
  });
}
