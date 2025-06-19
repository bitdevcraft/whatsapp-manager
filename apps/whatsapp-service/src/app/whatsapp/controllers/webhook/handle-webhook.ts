// src/controllers/root.controller.ts
import { createBaseController } from "@/lib/controller";
import type { Request, Response } from "express";
import { webhookHandler } from "@/app/whatsapp/config";

export const handleWebhook = createBaseController().handle(async (req) => {
  webhookHandler.handleWebhook(req);
});
