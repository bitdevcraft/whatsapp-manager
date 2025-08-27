"use client";

import { SocketEventPayloads } from "@workspace/shared";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

import { env } from "@/env/client";

interface SocketContextType {
  socket: null | Socket<SocketEventPayloads>;
  teamId: string;
  userId: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  teamId: string;
  userId: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  teamId,
  userId,
}) => {
  const [socket, setSocket] = useState<null | Socket<SocketEventPayloads>>(
    null
  );

  useEffect(() => {
    const socketInstance: Socket<SocketEventPayloads> = io(
      env.NEXT_PUBLIC_WEB_SOCKET,
      {
        path: "/socket.io",
        query: {
          teamId,
          userId,
        },
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, teamId]);

  return (
    <SocketContext.Provider value={{ socket, teamId, userId }}>
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
