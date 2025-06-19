import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { SocketRegistry } from "./socket-registry";

export const socketRegistry = new SocketRegistry();
export let ioInstance: Server;

export function initSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });
  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socketRegistry.register(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    socket.on("disconnect", () => {
      socketRegistry.unregister(socket.id);
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
}
