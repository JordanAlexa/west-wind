import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchPosts, searchUsers } from '../api/search';
import { Post } from '../../feed/components/Post';
import { Loader2 } from 'lucide-react';
import { Layout } from '../../../components/Layout';
import { ComposerModal } from '../../composer/components/ComposerModal';
import { SearchInput } from '../components/SearchInput';

export const Search = () => {
    // simple search params handling
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q') || '';

    const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const { data: posts, isLoading: isLoadingPosts } = useQuery({
        queryKey: ['search-posts', query],
        queryFn: () => searchPosts(query),
        enabled: !!query && activeTab === 'posts',
    });

    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['search-users', query],
        queryFn: () => searchUsers(query),
        enabled: !!query && activeTab === 'users',
    });

    return (
        <>
            <Layout onNewPost={() => setIsComposerOpen(true)}>
                <div className="w-full min-h-screen bg-white">
                    {/* Mobile/Tablet Search Header - Hidden on Desktop */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 lg:hidden">
                        <SearchInput initialValue={query} />
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 py-4 text-center font-bold hover:bg-gray-50 transition-colors ${activeTab === 'posts'
                                ? 'text-black border-b-2 border-blue-500'
                                : 'text-gray-500'
                                }`}
                            onClick={() => setActiveTab('posts')}
                        >
                            Posts
                        </button>
                        <button
                            className={`flex-1 py-4 text-center font-bold hover:bg-gray-50 transition-colors ${activeTab === 'users'
                                ? 'text-black border-b-2 border-blue-500'
                                : 'text-gray-500'
                                }`}
                            onClick={() => setActiveTab('users')}
                        >
                            People
                        </button>
                    </div>

                    {/* Content */}
                    <div className="pb-20">
                        {!query ? (
                            <div className="p-8 text-center text-gray-500">
                                Try searching for people, topics, or keywords
                            </div>
                        ) : (
                            <>
                                {activeTab === 'posts' && (
                                    <>
                                        {isLoadingPosts ? (
                                            <div className="flex justify-center p-8">
                                                <Loader2 className="animate-spin text-blue-500" />
                                            </div>
                                        ) : posts?.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                No posts found for "{query}"
                                            </div>
                                        ) : (
                                            posts?.map((post) => (
                                                <div key={post.id} className="border-b border-gray-100">
                                                    <Post post={post} />
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}

                                {activeTab === 'users' && (
                                    <>
                                        {isLoadingUsers ? (
                                            <div className="flex justify-center p-8">
                                                <Loader2 className="animate-spin text-blue-500" />
                                            </div>
                                        ) : users?.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                No people found for "{query}"
                                            </div>
                                        ) : (
                                            users?.map((user) => (
                                                <div key={user.id} className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                                    <img
                                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-gray-900">{user.display_name || user.username}</div>
                                                        <div className="text-gray-500 text-sm">@{user.username}</div>
                                                        {user.bio && <div className="text-gray-600 text-sm mt-1">{user.bio}</div>}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                            </>
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
