import { proxyToBackend } from "@/lib/proxy";

/**
 * GET /api/users/public-key → Proxies to backend GET /users/public-key
 * No caching for auth-related public key lookup unless specified.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();

  return proxyToBackend({
    backendPath: `/users/public-key${searchParams ? `?${searchParams}` : ""}`,
    request,
    cacheControl: "no-store",
  });
}
