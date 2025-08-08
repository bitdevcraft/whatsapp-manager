import { webhookHandler } from "@/app/whatsapp/config";
// src/controllers/root.controller.ts
import { createBaseController } from "@/lib/controller";

export const handleVerification = createBaseController().handle(
  async (req, res) => {
    const { body, statusCode } = webhookHandler.handleVerification(req);

    return res.status(statusCode).type("text/plain").send(body);
  }
);
