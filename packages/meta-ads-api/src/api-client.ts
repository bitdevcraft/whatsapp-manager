import { HttpClient } from './http-client';
import { Middleware } from './middleware';
// import { UserCategory } from './categories/UserCategory';

export interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  middlewares?: Middleware[];
}

export class ApiClient {
  private readonly http: HttpClient;
//   public readonly user: UserCategory;

  constructor(config: ApiClientConfig) {
    this.http = new HttpClient(config.baseURL, config.middlewares);
    // this.user = new UserCategory(this.http);
    // 👉 add more categories here, e.g.
    // this.product = new ProductCategory(this.http);
  }
}
