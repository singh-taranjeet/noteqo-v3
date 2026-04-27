import { proxyToBackend } from "@/lib/proxy";

interface RouteContext {
  params: Promise<{ mediaId: string }>;
}

/**
 * DELETE /api/media/:mediaId → Proxies to backend DELETE /media/:mediaId
 *
 * Deletes an encrypted media blob and its metadata.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const { mediaId } = await context.params;

  return proxyToBackend({
    backendPath: `/media/${mediaId}`,
    request,
    cacheControl: "no-store",
  });
}
