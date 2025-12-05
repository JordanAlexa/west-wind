import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../features/auth/stores/authStore';
import { SocketContext } from '../context/SocketContext';
import { auth } from '../lib/firebase';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useAuthStore((state) => state.user);

  const [activeChatUser, setActiveChatUser] = useState<{ uid: string; displayName: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const openChat = (user: { uid: string; displayName: string }) => {
    setActiveChatUser(user);
    setUnreadCount(0);
  };

  const closeChat = () => {
    setActiveChatUser(null);
  };

  useEffect(() => {
    if (!user?.uid) {
      if (socket) {
        console.log('Disconnecting socket (no user)');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Prevent re-connecting if already connected with same user? 
    // Socket.io handles this but let's be safe.
    if (socket && socket.connected) {
        // We might want to re-auth if token changed, but for now let's assume session is stable
        return;
    }

    console.log('Initializing socket for user:', user.uid);

    const newSocket = io('http://localhost:3000', {
      auth: async (cb) => {
        const currentUser = auth.currentUser;
        if (currentUser) {
           try {
               const token = await currentUser.getIdToken();
               cb({ token });
           } catch (e) {
               console.error('Error getting token for socket:', e);
               cb({});
           }
        } else {
           cb({});
        }
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
        console.error('Socket connect error:', err);
    });

    newSocket.on('new_message_notification', (data: { from: string, content: string }) => {
        setUnreadCount(prev => prev + 1);
        import('sonner').then(({ toast }) => {
            toast.message('New Message', {
                description: data.content,
            });
        });
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket');
      newSocket.disconnect();
    };
  }, [user?.uid]); // Only re-run if UID changes

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeChatUser, openChat, closeChat, unreadCount }}>
      {children}
      {activeChatUser && <ChatWindow user={activeChatUser} onClose={closeChat} />}
    </SocketContext.Provider>
  );
};

import { ChatWindow } from '../features/chat/components/ChatWindow';
