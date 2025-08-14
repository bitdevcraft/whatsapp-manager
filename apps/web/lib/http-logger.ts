/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserWithTeam } from "./db/queries";

// lib/httpLogger.ts
type Handler = (req: Request, ctx: any) => Response | Promise<Response>;
type Handlers = Partial<
  Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS", Handler>
>;

const SENSITIVE_HEADERS = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-secret-key",
];

function cleanHeaders(h: Headers) {
  const out: Record<string, string> = {};
  h.forEach((v, k) => {
    out[k] = SENSITIVE_HEADERS.includes(k.toLowerCase()) ? "[redacted]" : v;
  });
  return out;
}

function canLogBody(headers: Headers, max = 10_000) {
  const ct = headers.get("content-type") || "";
  const clRaw = headers.get("content-length");
  const cl = clRaw ? Number(clRaw) : NaN;
  const isTexty =
    /application\/json|text\/|application\/x-www-form-urlencoded/.test(ct);
  return isTexty && (!Number.isFinite(cl) || cl <= max);
}

function maybeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function withLogging<T extends Handlers>(
  handlers: T,
  opts?: { maxBody?: number; sink?: (record: any) => void }
) {
  const maxBody = opts?.maxBody ?? 10_000; // 10KB
  const sink = opts?.sink ?? ((r) => console.log(JSON.stringify(r)));

  const wrap = (fn?: Handler): Handler | undefined => {
    if (!fn) return undefined;
    return async (req: Request, ctx: any) => {
      const start = Date.now();
      const url = new URL(req.url);
      const rid = req.headers.get("x-request-id") ?? crypto.randomUUID();

      const userWithTeam = await getUserWithTeam();

      // Read a clone for logging (so the original remains usable)
      const reqClone = req.clone();
      let requestBody: unknown = undefined;
      if (canLogBody(reqClone.headers, maxBody)) {
        const t = await reqClone.text();
        requestBody = (reqClone.headers.get("content-type") || "").includes(
          "application/json"
        )
          ? maybeParseJson(t)
          : t;
      }

      const res = await fn(req, ctx);

      const resClone = res.clone();
      let responseBody: unknown = undefined;
      if (canLogBody(resClone.headers, maxBody)) {
        const t = await resClone.text();
        responseBody = (resClone.headers.get("content-type") || "").includes(
          "application/json"
        )
          ? maybeParseJson(t)
          : t;
      }

      sink({
        ts: new Date().toISOString(),
        id: rid,
        method: req.method,
        path: url.pathname + url.search,
        durationMs: Date.now() - start,
        status: res.status,
        request: {
          headers: cleanHeaders(req.headers),
          body: requestBody,
        },
        response: {
          headers: cleanHeaders(res.headers),
          body: responseBody,
        },
        userId: userWithTeam?.user.id,
        teamId: userWithTeam?.teamId,
      });

      // ensure the request id is on the way out
      const out = new Response(res.body, res);
      out.headers.set("x-request-id", rid);
      return out;
    };
  };

  return {
    GET: wrap(handlers.GET),
    POST: wrap(handlers.POST),
    PUT: wrap(handlers.PUT),
    PATCH: wrap(handlers.PATCH),
    DELETE: wrap(handlers.DELETE),
    OPTIONS: wrap(handlers.OPTIONS),
  } as T;
}
