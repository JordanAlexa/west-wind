import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ChatWindowProps {
    user: { uid: string; displayName: string };
    onClose: () => void;
}

interface Message {
    from: string;
    content: string;
    timestamp: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ user: targetUser, onClose }) => {
    const { socket } = useSocket();
    const currentUser = useAuthStore((state) => state.user);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket || !currentUser) return;

        const roomId = [currentUser.uid, targetUser.uid].sort().join('_');
        socket.emit('join_room', roomId);

        const handleReceiveMessage = (message: Message) => {
            if (message.from === targetUser.uid || message.from === currentUser?.uid) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            // Optional: leave room?
        };
    }, [socket, targetUser.uid, currentUser?.uid]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() || !socket) return;

        const content = inputValue;
        
        // Optimistic update
        const newMessage: Message = {
            from: currentUser?.uid || 'me',
            content,
            timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');

        socket.emit('send_message', {
            to: targetUser.uid,
            content
        });
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex flex-col z-50">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{targetUser.displayName}</span>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                    const isMe = msg.from === currentUser?.uid || msg.from === 'me';
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                isMe 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" onClick={handleSend}>Send</Button>
            </div>
        </div>
    );
};
