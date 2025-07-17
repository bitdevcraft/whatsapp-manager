// Defines how middleware can hook into the request/response flow

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Middleware {
  onRequest?(config: RequestConfig): Promise<RequestConfig> | RequestConfig;
  onResponse?(response: Response): Promise<Response> | Response;
  onError?(error: any): Promise<any> | any;
}
