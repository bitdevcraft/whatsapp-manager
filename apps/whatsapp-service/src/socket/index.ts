import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { SocketRegistry } from "./socket-registry";

export const socketRegistry = new SocketRegistry();
export let ioInstance: Server;

export function initSocket(server: HttpServer) {
  const io = new Server(server, {
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
