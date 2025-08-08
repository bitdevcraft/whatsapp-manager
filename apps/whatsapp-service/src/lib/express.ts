import type { Express } from "express";
import type { Server } from "http";

import cors from "cors";
import express from "express";
import { createServer as createHttpServer } from "http";
import morgan from "morgan";

import { v1Routes } from "@/app/v1/routes";
import { waRoutes } from "@/app/whatsapp/routes";

export function createServer(): { app: Express; server: Server } {
  const app = express();

  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // Version 1 API Routes
  v1Routes.forEach(({ path, router }) => app.use(`/v1${path}`, router));

  // WhatsApp Routes
  waRoutes.forEach(({ path, router }) => app.use(`/wa-app${path}`, router));

  const server = createHttpServer(app);

  return { app, server };
}
