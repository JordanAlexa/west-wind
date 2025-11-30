
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Post } from '../../feed/components/Post';
import { CommentComposer } from './CommentComposer';
import { type Post as PostType } from '../../feed/api/posts';

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PostType | null;
}

export const ReplyModal = ({ isOpen, onClose, post }: ReplyModalProps) => {
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

    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[600px] bg-bg border-2 border-modal-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 rounded-full hover:bg-surface-hover transition-colors text-muted"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-text">Reply</span>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>

                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    {/* Parent Post Context */}
                    <div className="mb-4 relative">
                        <Post post={post} />
                        <div className="absolute left-8 top-16 bottom-[-20px] w-0.5 bg-border" />
                    </div>

                    {/* Composer */}
                    <div className="pl-4">
                        <CommentComposer parentId={post.id} onSuccess={onClose} onCancel={onClose} />
                    </div>
                </div>
            </div>
        </div>
    );
};
