import express, { Router } from 'express';
import { webhookHandler } from '../handlers/webhookHandler';

const router: Router = express.Router();

// Set up webhook endpoints
router.get('/wa-app/webhook', (req, res) => {
    webhookHandler.handleVerificationRequest(req, res);
});

// Handle webhook requests
router.post('/wa-app/webhook', (req, res) => {
    webhookHandler.handleWebhookRequest(req, res);
});

export default router;
