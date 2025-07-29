import { Middleware, RequestConfig, HttpMethod } from "./middleware";
import { ApiError } from "./errors";

export class HttpClient {
  constructor(
    private readonly baseURL: string,
    private readonly middlewares: Middleware[] = []
  ) {}

  public async request<T>(
    url: string,
    method: HttpMethod,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<T> {
    // build initial config
    let cfg: RequestConfig = {
      url: this.baseURL + url,
      method,
      headers,
      body,
    };

    // run onRequest hooks
    for (const mw of this.middlewares) {
      if (mw.onRequest) cfg = await mw.onRequest(cfg);
    }

    try {
      const resp = await fetch(cfg.url, {
        method: cfg.method,
        headers: {
          "Content-Type": "application/json",
          ...cfg.headers,
        },
        body: cfg.body != null ? JSON.stringify(cfg.body) : undefined,
      });

      // run onResponse hooks
      let hooked = resp;
      for (const mw of this.middlewares) {
        if (mw.onResponse) hooked = await mw.onResponse(hooked);
      }

      if (!hooked.ok) {
        const data = await hooked.json().catch(() => undefined);
        throw new ApiError(
          `HTTP ${hooked.status} on ${cfg.method} ${url}`,
          hooked.status,
          data
        );
      }

      return (await hooked.json()) as T;
    } catch (err) {
      // run onError hooks
      for (const mw of this.middlewares) {
        if (mw.onError) await mw.onError(err);
      }
      throw err;
    }
  }
}
