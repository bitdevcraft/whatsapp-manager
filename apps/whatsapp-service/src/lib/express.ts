import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer as createHttpServer } from "http";

import type { Express } from "express";
import type { Server } from "http";
import { v1Routes } from "@/app/v1/routes";
import { waRoutes } from "@/app/whatsapp/routes";

export function createServer(): { app: Express; server: Server } {
  const app = express();

  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // Version 1 API Routes
  v1Routes.forEach(({ router, path }) => app.use(`/v1${path}`, router));

  // WhatsApp Routes
  waRoutes.forEach(({ router, path }) => app.use(`/wa-app${path}`, router));

  const server = createHttpServer(app);

  return { app, server };
}
