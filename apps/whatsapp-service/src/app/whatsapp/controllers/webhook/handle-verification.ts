// src/controllers/root.controller.ts
import { BaseController, createBaseController } from "@/lib/controller";
import type { Request, Response } from "express";
import { webhookHandler } from "@/app/whatsapp/config";

export const handleVerification = createBaseController().handle(async (req, res) => {
  const { statusCode, body } = webhookHandler.handleVerification(req);

  return res.status(statusCode).type("text/plain").send(body);
});
