import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { fetchPosts } from '../features/feed/api/posts';
import { Post } from '../features/feed/components/Post';
import { Layout } from '../components/Layout';
import { ComposerModal } from '../features/composer/components/ComposerModal';

export const HashtagFeed = () => {
    const { tag } = useParams({ from: '/hashtag/$tag' });
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['posts', tag],
        queryFn: fetchPosts,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: 0,
    });

    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <>
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-bold text-xl">#{tag}</h1>
                    </div>
                </div>

                <div className="w-full min-h-screen bg-white">
                    {status === 'pending' ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : status === 'error' ? (
                        <div className="p-4 text-center text-red-500">Error loading posts</div>
                    ) : (
                        <>
                            {data.pages.map((page, i) => (
                                <div key={i}>
                                    {page.posts.map((post) => (
                                        <Post key={post.id} post={post} />
                                    ))}
                                </div>
                            ))}
                            {data.pages[0].posts.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No posts found with #{tag}
                                </div>
                            )}
                        </>
                    )}

                    <div ref={loadMoreRef} className="h-10 flex justify-center items-center p-4">
                        {isFetchingNextPage && (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        )}
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
