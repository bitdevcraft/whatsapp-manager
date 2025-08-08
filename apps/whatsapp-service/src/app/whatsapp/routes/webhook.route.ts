import { Router } from "express";

import type { Route } from "@/interfaces/routes.interface";

import { whatsAppController as c } from "../controllers/webhook";
import { webhookServices } from "../services";

webhookServices.registerWebhook();

const router = Router();
const path = "";

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/webhook", c.handleVerification);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/webhook", c.handleWebhook);

export const webhookRoute: Route = { path, router };
