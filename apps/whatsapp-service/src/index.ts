import "dotenv/config";

import { initSocket } from "@/socket";
import { setupWorker } from "@/jobs/processors/example.processor";
import { createServer } from "@/lib/express";

const port = process.env.PORT || 4000;

const { server } = createServer();

initSocket(server);
setupWorker();

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
