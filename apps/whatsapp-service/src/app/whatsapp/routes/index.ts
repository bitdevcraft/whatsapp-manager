import type { Route } from "@/interfaces/routes.interface";
import { webhookRoute } from "./webhook.route";

export const waRoutes: Route[] = [
  // Webhook
  webhookRoute,
];
