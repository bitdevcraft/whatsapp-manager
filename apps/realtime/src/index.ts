import { QueueEvents, Worker } from "bullmq";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import express from "express";

import "dotenv/config";

// ── Configuration ──────────────────────────────────────────────────────────────

const redisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

// ── Express + HTTP Server ─────────────────────────────────────────────────────
const app = express();
const server = createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ── BullMQ QueueEvents ────────────────────────────────────────────────────────

const queueName = "whatsapp-events";
const queueEvents = new QueueEvents(queueName, { connection: redisOptions });

queueEvents
  .waitUntilReady()
  .then(() => {
    console.log(`✅ Connected to BullMQ QueueEvents on "${queueName}"`);

    queueEvents.on("completed", (event) => {
      console.log("realtime-mq-completed");
      io.emit("whatsapp_message", event.returnvalue);
    });

    queueEvents.on("failed", (event) => {
      console.log("realtime-mq-failed");
      io.emit("whatsapp_error", {
        jobId: event.jobId,
        reason: event.failedReason,
      });
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to QueueEvents:", err);
    process.exit(1);
  });

new Worker(
  "whatsapp-events",
  async (job) => {
    // 1) Business logic
    // 2) Immediately broadcast
    io.emit("whatsapp_message", {});
  },
  { connection: redisOptions }
);

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Realtime on ${port}`));
