import { webhookHandler } from "@/app/whatsapp/config";
// src/controllers/root.controller.ts
import { createBaseController } from "@/lib/controller";

export const handleWebhook = createBaseController().handle(async (req, res) => {
  const response = webhookHandler.handleWebhook(req);
  return res.status(200).json(response);
});
