import { proxyToBackend } from "@/lib/proxy";

/**
 * POST /api/notes → Proxies to backend POST /notes
 *
 * Creates a new note. No caching.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json();

  return proxyToBackend({
    backendPath: "/notes",
    request,
    body,
    cacheControl: "no-store",
  });
}
