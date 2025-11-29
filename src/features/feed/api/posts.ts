import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Post {
    id: string;
    content: string;
    image?: string;
    timestamp: string;
    likes: number;
    replies: number;
    reposts: number;
    author: {
        id: string;
        name: string;
        handle: string;
        avatar: string;
        banner: string;
        followersCount: number;
        followsCount: number;
        postsCount: number;
    };
    parentId?: string;
    replyCount?: number;
    likedByViewer?: boolean;
    isEdited?: boolean;
    editedAt?: string;
    editCount?: number;
}

export async function fetchPosts({ pageParam = 0, queryKey }: { pageParam?: number, queryKey: (string | undefined)[] }): Promise<{ posts: Post[], nextCursor: number | undefined }> {
    // queryKey structure: ['posts', hashtag, authorHandle, tab]
    const [_key, hashtag, authorHandle, tab] = queryKey;
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    const params: any = { cursor: pageParam };

    if (hashtag) params.hashtag = hashtag;
    if (authorHandle) params.author_handle = authorHandle;
    if (tab) params.tab = tab;
    if (user.uid) params.firebase_uid = user.uid;

    const response = await axios.get(`${API_URL}/posts`, { params });
    const data = response.data;

    return {
        posts: data.posts.map((p: any) => ({
            ...p,
            author: {
                ...p.author,
                banner: '', // Default
                followersCount: 0, // Default
                followsCount: 0, // Default
                postsCount: 0 // Default
            }
        })) as Post[],
        nextCursor: data.nextCursor,
    };
}

export async function fetchPostThread(postId: string) {
    const response = await axios.get(`${API_URL}/posts/${postId}/thread`);
    const data = response.data;

    // Helper to map backend post to frontend Post type
    const mapPost = (p: any): Post => ({
        ...p,
        author: {
            ...p.author,
            banner: '',
            followersCount: 0,
            followsCount: 0,
            postsCount: 0
        }
    });

    return {
        post: mapPost(data.post),
        parents: [], // TODO: Implement parent fetching in backend
        replies: data.replies.map(mapPost)
    };
}

export async function createPost(content: string, mediaUrl?: string, parentId?: string) {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');

    const response = await axios.post(`${API_URL}/posts`, {
        firebase_uid: user.uid,
        content,
        media_url: mediaUrl,
        parent_id: parentId
    });

    return response.data;
}

export async function toggleLike(postId: string, isLiked: boolean) {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    const method = isLiked ? 'DELETE' : 'POST';

    const response = await axios({
        method,
        url: `${API_URL}/likes`,
        data: {
            firebase_uid: user.uid,
            post_id: postId
        }
    });

    return response.data;
}

export async function deletePost(postId: string) {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    await axios.delete(`${API_URL}/posts/${postId}`, {
        data: { firebase_uid: user.uid }
    });
}

export async function editPost(postId: string, content: string) {
    const user = JSON.parse(localStorage.getItem('west-wind-user') || '{}');
    await axios.put(`${API_URL}/posts/${postId}`, {
        firebase_uid: user.uid,
        content
    });
}
