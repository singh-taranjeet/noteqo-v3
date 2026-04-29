import { proxyToBackend } from "@/lib/proxy";

export async function GET(request: Request) {
  return proxyToBackend({
    backendPath: "/spaces/recently/updated-notes",
    request,
    cacheControl: "no-store",
  });
}
