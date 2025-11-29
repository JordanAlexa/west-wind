import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat, Share } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import type { Post as PostType } from '../api/posts';
import { RichText } from '../../../components/RichText';
import { usePostInteraction } from '../hooks/usePostInteraction';
import { ReplyModal } from '../../composer/components/ReplyModal';
import { formatRelativeTime } from '../../../utils/date';
import { MediaEmbed } from './MediaEmbed';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useAuthStore } from '../../auth/stores/authStore';
import { deletePost } from '../api/posts';
import { EditPostModal } from './EditPostModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PostProps {
    post: PostType;
}

export const Post: React.FC<PostProps> = ({ post }) => {
    const navigate = useNavigate();
    const { like, repost, isLiking, isReposting } = usePostInteraction(post);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const canDelete = user && (user.role === 'SUPER.ADMIN' || user.role === 'ADMIN' || user.uid === post.author.id);
    const canEdit = user && user.uid === post.author.id;

    const { mutate: deletePostMutation } = useMutation({
        mutationFn: () => deletePost(post.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post-thread'] });
        }
    });

    const handlePostClick = () => {
        navigate({
            to: '/profile/$handle/post/$rkey',
            params: {
                handle: post.author.handle,
                rkey: post.id,
            },
        });
    };

    return (
        <>
            <div
                onClick={handlePostClick}
                className="border-b border-gray-200 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
                <div className="flex gap-3">
                    <Link
                        to="/profile/$handle"
                        params={{ handle: post.author.handle }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                    >
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
                        />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5 text-[15px] leading-5">
                            <Link
                                to="/profile/$handle"
                                params={{ handle: post.author.handle }}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-gray-900 hover:underline truncate"
                            >
                                {post.author.name}
                            </Link>
                            <span className="text-gray-500 truncate flex-shrink min-w-0">{post.author.handle}</span>
                            <span className="text-gray-500 flex-shrink-0">·</span>
                            <span className="text-gray-500 flex-shrink-0">
                                {formatRelativeTime(post.timestamp)}
                            </span>
                            {post.isEdited && <span className="text-gray-400 text-xs ml-1">(edited)</span>}

                            {(canDelete || canEdit) && (
                                <div className="ml-auto relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(!isMenuOpen);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-6 bg-white shadow-lg rounded-lg border border-gray-100 z-10 w-32 overflow-hidden">
                                            {canEdit && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsEditModalOpen(true);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Are you sure you want to delete this post?')) {
                                                            deletePostMutation();
                                                        }
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-3 text-[15px] leading-5 text-gray-900">
                            <RichText content={post.content} />
                        </div>

                        {post.image && (
                            <div className="mb-3">
                                <MediaEmbed
                                    src={post.image}
                                    alt="Post content"
                                    className="w-full max-h-[500px]"
                                />
                            </div>
                        )}

                        <div className="flex justify-between text-gray-500 max-w-md">
                            <button
                                className="flex items-center gap-2 hover:text-blue-500 group"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsReplyModalOpen(true);
                                }}
                            >
                                <div className="p-2 rounded-full group-hover:bg-blue-50">
                                    <MessageCircle size={18} />
                                </div>
                                <span className="text-sm">{post.replyCount || post.replies || 0}</span>
                            </button>
                            <button
                                className={`flex items-center gap-2 group transition-colors ${isReposting ? 'text-green-500' : 'hover:text-green-500'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    repost();
                                }}
                                disabled={isReposting}
                            >
                                <div className="p-2 rounded-full group-hover:bg-green-50">
                                    <Repeat size={18} className={isReposting ? 'animate-pulse' : ''} />
                                </div>
                                <span className="text-sm">{post.reposts}</span>
                            </button>
                            <button
                                className={`flex items-center gap-2 group transition-colors ${isLiking ? 'text-red-500' : 'hover:text-red-500'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    like();
                                }}
                                disabled={isLiking}
                            >
                                <div className="p-2 rounded-full group-hover:bg-red-50">
                                    <Heart
                                        size={18}
                                        className={`${isLiking ? 'animate-pulse' : ''} ${post.likedByViewer ? 'fill-red-500 text-red-500' : ''}`}
                                    />
                                </div>
                                <span className={`text-sm ${post.likedByViewer ? 'text-red-500' : ''}`}>{post.likes}</span>
                            </button>
                            <button
                                className="flex items-center gap-2 hover:text-blue-500 group"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-2 rounded-full group-hover:bg-blue-50">
                                    <Share size={18} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ReplyModal
                isOpen={isReplyModalOpen}
                onClose={() => setIsReplyModalOpen(false)}
                post={post}
            />
            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
            />
        </>
    );
};
