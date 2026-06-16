import { serve } from "bun";
import index from "./index.html";

const runtimeEnv = ((globalThis as any).process?.env ?? (import.meta as any).env ?? {}) as Record<
  string,
  string | undefined
>;

const upstreamBaseUrl = new URL(runtimeEnv.BUN_PUBLIC_API_URL || runtimeEnv.API_URL || "http://82.146.19.6:8080");

async function proxyApi(request: Request): Promise<Response> {
  const upstreamUrl = new URL(request.url);
  upstreamUrl.protocol = upstreamBaseUrl.protocol;
  upstreamUrl.host = upstreamBaseUrl.host;

  // Explicitly copy all headers including Cookie and Authorization
  // (new Request(url, req) strips cookies on cross-origin)
  const headers = new Headers(request.headers);
  headers.set("Host", upstreamBaseUrl.host);

  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual",
  });

  // Build response headers, explicitly preserving multiple Set-Cookie headers
  const responseHeaders = new Headers(upstreamResponse.headers);

  // Fetch API Headers may merge Set-Cookie into one entry;
  // use getSetCookie() to get them individually and re-append
  const setCookies = upstreamResponse.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    responseHeaders.delete("Set-Cookie");
    for (const cookie of setCookies) {
      responseHeaders.append("Set-Cookie", cookie);
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

const server = serve({
  routes: {
    "/api/v1/*": proxyApi,
    "/*": index,
  },
  port: 3002,
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
  hostname: "0.0.0.0"
});

console.log(`🚀 User App running at ${server.url}`);

