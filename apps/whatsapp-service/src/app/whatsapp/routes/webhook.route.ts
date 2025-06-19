import type { Route } from "@/interfaces/routes.interface";
import { Router } from "express";
import { whatsAppController as c } from "../controllers/webhook";
import { webhookServices } from "../services";

webhookServices.registerWebhook();

const router = Router();
const path = "";

router.get("/webhook", c.handleVerification);
router.post("/webhook", c.handleWebhook);

export const webhookRoute: Route = { path, router };
