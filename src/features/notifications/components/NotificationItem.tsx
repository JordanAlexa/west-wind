import React from 'react';
import { Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Notification } from '../api/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
    notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const { type, actor, post, reply, created_at } = notification;

    const getIcon = () => {
        switch (type) {
            case 'like':
                return <Heart className="w-5 h-5 text-red-500 fill-current" />;
            case 'reply':
                return <MessageCircle className="w-5 h-5 text-blue-500 fill-current" />;
            case 'follow':
                return <UserPlus className="w-5 h-5 text-purple-500" />;
            case 'mention':
                return <AtSign className="w-5 h-5 text-green-500" />;
            default:
                return null;
        }
    };

    const getMessage = () => {
        switch (type) {
            case 'like':
                return 'liked your post';
            case 'reply':
                return 'replied to your post';
            case 'follow':
                return 'followed you';
            case 'mention':
                return 'mentioned you in a post';
            default:
                return '';
        }
    };

    // Remove @ from handle for the URL param if it exists, although route might expect it.
    // The profile route is /profile/$handle.
    // If actor.handle is "@alice", params should be { handle: "@alice" } or "alice"?
    // In Post.tsx it uses post.author.handle.
    // Let's assume actor.handle is correct.

    return (
        <div className="flex gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex-shrink-0 mt-1">
                {getIcon()}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Link
                        to="/profile/$handle"
                        params={{ handle: actor.handle }}
                        className="flex-shrink-0"
                    >
                        <img
                            src={actor.avatar || `https://ui-avatars.com/api/?name=${actor.name}&background=random`}
                            alt={actor.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </Link>
                    <div className="text-sm">
                        <Link
                            to="/profile/$handle"
                            params={{ handle: actor.handle }}
                            className="font-bold hover:underline"
                        >
                            {actor.name}
                        </Link>
                        <span className="text-gray-500 ml-1">
                            {getMessage()}
                        </span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="text-gray-400">
                            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                        </span>
                    </div>
                </div>

                {post && (
                    <Link
                        to="/profile/$handle/post/$rkey"
                        params={{ handle: actor.handle, rkey: post.id }}
                        className="block mt-1 text-gray-600 text-sm line-clamp-2"
                    >
                        {post.content}
                    </Link>
                )}

                {reply && (
                    <Link
                        to="/profile/$handle/post/$rkey"
                        params={{ handle: actor.handle, rkey: post?.id || '' }}
                        className="block mt-2 text-gray-800 text-sm"
                    >
                        {reply.content}
                    </Link>
                )}
            </div>
        </div>
    );
};
