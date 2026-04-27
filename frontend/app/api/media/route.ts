import { proxyToBackend } from "@/lib/proxy";

/**
 * POST /api/media → Proxies to backend POST /media
 * 
 * Handles encrypted media uploads as multipart/form-data.
 */
export async function POST(request: Request) {
  // We extract formData to pass it to proxyToBackend
  const body = await request.formData();

  return proxyToBackend({
    backendPath: "/media",
    request,
    body,
    cacheControl: "no-store",
  });
}
