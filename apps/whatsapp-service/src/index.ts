import "dotenv/config";

import { initSocket } from "@/socket";
import { setupWorker } from "@/jobs/processors/example.processor";
import { createServer } from "@/lib/express";
import { setupBulkMessagesOutgoingWorker } from "@/jobs/processors/bulk-messages-outgoing.processor";
import { setupBulkMessagesWorker } from "./jobs/processors/bulk-messages.processor";

const port = process.env.PORT || 4000;

const { server } = createServer();

// Socket
initSocket(server);

// Workers
setupWorker();
setupBulkMessagesOutgoingWorker();
setupBulkMessagesWorker();

// Server Listens
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
