import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type Post as PostType, editPost } from '../../feed/api/posts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PostType | null;
}

export const EditPostModal = ({ isOpen, onClose, post }: EditPostModalProps) => {
    const [content, setContent] = useState('');
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (post) {
            setContent(post.content);
        }
    }, [post]);

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            if (!post) return;
            await editPost(post.id, content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post-thread'] });
            toast.success('Post updated successfully');
            onClose();
        },
        onError: () => {
            toast.error('Failed to update post');
        }
    });

    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-[600px] bg-white rounded-2xl p-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h2 className="text-xl font-bold">Edit Post</h2>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <textarea
                    className="w-full h-32 p-3 text-lg border-none resize-none focus:outline-none placeholder-gray-400"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                />
                <div className="flex justify-end mt-4 gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => mutate()}
                        disabled={isPending || !content.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 font-bold transition-colors"
                    >
                        {isPending ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};
