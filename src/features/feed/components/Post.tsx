import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat, Share, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import type { Post as PostType } from '../api/posts';
import { RichText } from '../../../components/RichText';
import { usePostInteraction } from '../hooks/usePostInteraction';
import { ReplyModal } from '../../composer/components/ReplyModal';
import { formatRelativeTime } from '../../../utils/date';
import { MediaEmbed } from './MediaEmbed';
import { useAuthStore } from '../../auth/stores/authStore';
import { deletePost } from '../api/posts';
import { EditPostModal } from './EditPostModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { toast } from 'sonner';

interface PostProps {
    post: PostType;
}

export const Post: React.FC<PostProps> = ({ post }) => {
    const navigate = useNavigate();
    const { like, repost, isLiking, isReposting } = usePostInteraction(post);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const canDelete = user && (user.role === 'SUPER.ADMIN' || user.role === 'ADMIN' || user.uid === post.author.id);
    const canEdit = user && user.uid === post.author.id;

    const { mutate: deletePostMutation } = useMutation({
        mutationFn: () => deletePost(post.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post-thread'] });
            toast.success('Post deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete post');
        }
    });

    const handlePostClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
            return;
        }

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
                className="border-b border-border p-3 bg-card-bg hover:bg-surface-hover transition-colors cursor-pointer"
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
                                className="font-bold text-text hover:underline truncate"
                            >
                                {post.author.name}
                            </Link>
                            <span className="text-muted truncate flex-shrink min-w-0">{post.author.handle}</span>
                            <span className="text-muted flex-shrink-0">·</span>
                            <span className="text-muted flex-shrink-0">
                                {formatRelativeTime(post.timestamp)}
                            </span>
                            {post.isEdited && (
                                <span className="text-muted text-xs ml-1">
                                    (edited{post.editedBy && post.editedBy.id !== post.author.id ? ` by ${post.editedBy.name}` : ''})
                                </span>
                            )}

                            {(canDelete || canEdit) && (
                                <div className="ml-auto relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMenuOpen(!isMenuOpen);
                                        }}
                                        className="p-1 hover:bg-surface-hover rounded-full text-muted"
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-6 bg-surface shadow-lg rounded-lg border border-border z-10 w-32 overflow-hidden">
                                            {canEdit && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log('Edit clicked');
                                                        setIsEditModalOpen(true);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text hover:bg-surface-hover text-left"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log('Delete clicked');
                                                        setIsDeleteModalOpen(true);
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

                        <div className="mb-3 text-[15px] leading-5 text-text">
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

                        <div className="flex justify-between text-muted max-w-md">
                            <button
                                className="flex items-center gap-2 hover:text-primary group"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsReplyModalOpen(true);
                                }}
                            >
                                <div className="p-2 rounded-full group-hover:bg-surface-hover">
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
                                <div className="p-2 rounded-full group-hover:bg-surface-hover">
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
                                <div className="p-2 rounded-full group-hover:bg-surface-hover">
                                    <Heart
                                        size={18}
                                        className={`${isLiking ? 'animate-pulse' : ''} ${post.likedByViewer ? 'fill-red-500 text-red-500' : ''}`}
                                    />
                                </div>
                                <span className={`text-sm ${post.likedByViewer ? 'text-red-500' : ''}`}>{post.likes}</span>
                            </button>
                            <button
                                className="flex items-center gap-2 hover:text-primary group"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-2 rounded-full group-hover:bg-surface-hover">
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
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deletePostMutation()}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                isDestructive
            />
        </>
    );
};
