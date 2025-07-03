// src/controllers/root.controller.ts
import { BaseController, createBaseController } from "@/lib/controller";
import type { Request, Response } from "express";
import { webhookHandler } from "@/app/whatsapp/config";

export const handleVerification = createBaseController().handle(
  async (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const { statusCode, body } = webhookHandler.handleVerification(req);

    return res.status(statusCode).json(body);
  }
);
