import type { Server as HttpServer } from "http";
import { DefaultEventsMap, Server as IOServer } from "socket.io";

import { SocketRegistry } from "./socket-registry";
import { SocketEventPayloads } from "@workspace/shared";

export const socketRegistry = new SocketRegistry();
export let ioInstance: IOServer<SocketEventPayloads>;

export function initSocket(server: HttpServer) {
  const io = new IOServer(server, {
    cors: { origin: "*" },
    path: "/socket.io", // match your client path
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    const teamId = socket.handshake.query.teamId as string;

    if (userId) {
      socketRegistry.register(userId, socket.id);
      console.log(`✅ User ${userId} connected with socket ${socket.id}`);

      // Join personal and team rooms
      socket.join(`user:${userId}`);
    }

    if (teamId) {
      socket.join(`team:${teamId}`);
      console.log(`🔗 User ${userId} joined team room team:${teamId}`);
    }

    socket.on("disconnect", () => {
      socketRegistry.unregister(socket.id);
      console.log(`❌ Socket ${socket.id} disconnected`);
    });
  });
}
