"use client";

import { env } from "@/env/client";
import { SocketEventPayloads } from "@workspace/shared";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket<SocketEventPayloads> | null;
  userId: string;
  teamId: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  userId: string;
  teamId: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  userId,
  teamId,
}) => {
  const [socket, setSocket] = useState<Socket<SocketEventPayloads> | null>(
    null
  );

  useEffect(() => {
    const socketInstance: Socket<SocketEventPayloads> = io(
      env.NEXT_PUBLIC_WEB_SOCKET,
      {
        path: "/socket.io",
        query: {
          userId,
          teamId,
        },
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, teamId]);

  return (
    <SocketContext.Provider value={{ socket, userId, teamId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
