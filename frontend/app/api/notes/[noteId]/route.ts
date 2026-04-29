import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";
import { PROXY_CACHE_CONFIG } from "@/constants/server";

interface RouteContext {
  params: Promise<{ noteId: string }>;
}

/**
 * GET /api/notes/[noteId] → Proxies to backend GET /notes/:noteId
 *
 * Returns a single encrypted note. Very short cache.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { noteId } = await context.params;

  return proxyToBackend({
    backendPath: `/notes/${noteId}`,
    request,
    cacheControl: "no-store",
  });
}

/**
 * PATCH /api/notes/[noteId] → Proxies to backend PATCH /notes/:noteId
 *
 * Updates an encrypted note. No caching.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { noteId } = await context.params;
  const body: unknown = await request.json();

  return proxyToBackend({
    backendPath: `/notes/${noteId}`,
    request,
    body,
    cacheControl: "no-store",
  });
}

/**
 * DELETE /api/notes/[noteId] → Proxies to backend DELETE /notes/:noteId
 *
 * Deletes a note. No caching.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { noteId } = await context.params;

  return proxyToBackend({
    backendPath: `/notes/${noteId}`,
    request,
    cacheControl: "no-store",
  });
}
