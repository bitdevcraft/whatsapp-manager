import "dotenv/config";
import express, { Request, Response } from "express";
import router from "./routes";
import { messagesOutgoingWorker } from "./lib/queues/message-outgoing-worker";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(router);

app.get("/", (req: Request, res: Response) => {
  res.send("WhatsApp API Server is running!");
});

messagesOutgoingWorker;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/wa-app/webhook`);
});
