// import { webhookHandler } from "@/handlers/webhookHandler";
import { webhookHandler } from "@/config/whatsapp";
import rawBodyMiddleware from "@/middleware/rawBody";
import { WebhookRequest } from "@workspace/wa-cloud-api/core/webhook";
import express, { Router } from "express";
import "../handlers";
const router: Router = express.Router();

// Set up webhook endpoints
router.get("/wa-app/webhook", (req) => {
  webhookHandler.handleVerification(req);
});

// Handle webhook requests
router.post("/wa-app/webhook", (req) => {
  webhookHandler.handleWebhook(req);
});

// // Handle Flow requests with rawBodyMiddleware
// router.post("/flow", rawBodyMiddleware, (req, res) => {
//   webhookHandler.handleFlow(req as WebhookRequest & { rawBody: string });
// });

export default router;
