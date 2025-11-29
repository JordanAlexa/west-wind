import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPostThread, type Post as PostType } from '../features/feed/api/posts';
import { Layout } from '../components/Layout';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ComposerModal } from '../features/composer/components/ComposerModal';
import { Post } from '../features/feed/components/Post';
import { CommentComposer } from '../features/composer/components/CommentComposer';

export const PostThread = () => {
    const { rkey } = useParams({ from: '/profile/$handle/post/$rkey' });
    // rkey is actually the post ID in our current implementation
    const postId = rkey;
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['post-thread', postId],
        queryFn: () => fetchPostThread(postId),
    });

    const handleReplySuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['post-thread', postId] });
    };

    if (isLoading) {
        return (
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-blue-500" />
                </div>
                <ComposerModal
                    isOpen={isComposerOpen}
                    onClose={() => setIsComposerOpen(false)}
                />
            </Layout>
        );
    }

    if (!data) {
        return (
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div>Post not found</div>
                <ComposerModal
                    isOpen={isComposerOpen}
                    onClose={() => setIsComposerOpen(false)}
                />
            </Layout>
        );
    }

    return (
        <>
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="w-full min-h-screen bg-white">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="font-bold text-xl">Post</h1>
                    </div>

                    <div className="pb-20">
                        {/* Parents */}
                        {data.parents.map((parent: any) => (
                            <div key={parent.id} className="relative">
                                <Post post={parent} />
                                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200" />
                            </div>
                        ))}

                        {/* Main Post */}
                        <div className="border-b border-gray-200">
                            <Post post={data.post} />
                        </div>

                        {/* Comment Composer */}
                        <CommentComposer parentId={data.post.id} onSuccess={handleReplySuccess} />

                        {/* Replies */}
                        {data.replies.map((reply: PostType) => (
                            <Post key={reply.id} post={reply} />
                        ))}
                    </div>
                </div>
            </Layout>

            <ComposerModal
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
            />
        </>
    );
};
