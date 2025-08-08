import "dotenv/config";

import { setupBulkMessagesOutgoingWorker } from "@/jobs/processors/bulk-messages-outgoing.processor";
import { setupWorker } from "@/jobs/processors/example.processor";
import { createServer } from "@/lib/express";
import { initSocket } from "@/socket";

import { setupBulkMessagesWorker } from "./jobs/processors/bulk-messages.processor";

const port = process.env.PORT || 4000;

const { server } = createServer();

// Socket
initSocket(server);

// Workers
const workers = [
  setupWorker(),
  setupBulkMessagesOutgoingWorker(),
  setupBulkMessagesWorker(),
];

// Server Listens
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

let shuttingDown = false;

async function shutDown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Graceful shutdown starting…");

  // 1. Stop HTTP
  await new Promise<void>((resolve) =>
    server.close(() => {
      console.log("HTTP server closed");
      resolve();
    })
  );

  // 2. Stop BullMQ
  workers.forEach(async (worker) => await worker.close());
  console.log("BullMQ worker closed");

  // 3. Exit
  console.log("Shutdown complete, exiting.");
  process.exit(0);
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
