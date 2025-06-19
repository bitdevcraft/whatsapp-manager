export class SocketRegistry {
  private userSocketMap = new Map<string, string>();

  register(userId: string, socketId: string): void {
    this.userSocketMap.set(userId, socketId);
  }

  unregister(socketId: string): void {
    for (const [userId, sid] of this.userSocketMap.entries()) {
      if (sid === socketId) {
        this.userSocketMap.delete(userId);
        break;
      }
    }
  }

  getSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  getUserId(socketId: string): string | undefined {
    for (const [userId, sid] of this.userSocketMap.entries()) {
      if (sid === socketId) return userId;
    }
    return undefined;
  }
}