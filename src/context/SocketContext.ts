import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeChatUser: { uid: string; displayName: string } | null;
  openChat: (user: { uid: string; displayName: string }) => void;
  closeChat: () => void;
  unreadCount: number;
}

export const SocketContext = createContext<SocketContextType>({ 
    socket: null, 
    isConnected: false,
    activeChatUser: null,
    openChat: () => {},
    closeChat: () => {},
    unreadCount: 0
});

export const useSocket = () => useContext(SocketContext);
