import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { fetchPosts } from '../api/posts';
import { Post } from './Post';

interface FeedProps {
    hashtag?: string;
    authorHandle?: string;
    tab?: string;
}

export const Feed = ({ hashtag, authorHandle, tab }: FeedProps) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['posts', hashtag, authorHandle, tab],
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

    if (status === 'pending') {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === 'error') {
        return <div className="p-4 text-center text-red-500">Error loading posts</div>;
    }

    return (
        <div className="w-full max-w-[600px] mx-auto bg-bg border-x border-border min-h-screen flex flex-col">
            {data.pages.map((page, i) => (
                <div key={i}>
                    {page.posts.map((post) => (
                        <Post key={post.id} post={post} />
                    ))}
                </div>
            ))}

            <div ref={loadMoreRef} className="h-10 flex justify-center items-center p-4">
                {isFetchingNextPage && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                )}
            </div>
        </div>
    );
};
