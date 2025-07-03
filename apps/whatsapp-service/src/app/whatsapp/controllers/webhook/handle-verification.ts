// src/controllers/root.controller.ts
import { BaseController, createBaseController } from "@/lib/controller";
import type { Request, Response } from "express";
import { webhookHandler } from "@/app/whatsapp/config";

export const handleVerification = createBaseController().handle(
  async (req, res) => {
    const response = webhookHandler.handleVerification(req);

    return res.status(200).json(response);
  }
);
