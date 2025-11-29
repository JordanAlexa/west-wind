export interface User {
    id: string;
    firebase_uid?: string;
    name: string;
    handle: string;
    avatar: string;
    banner?: string;
    bio?: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
}

export interface Post {
    id: string;
    author: User;
    content: string;
    image?: string;
    video?: string;
    likes: number;
    reposts: number;
    replies: number;
    timestamp: string;
    parentId?: string; // ID of the parent post if this is a reply
}

export const currentUser: User = {
    id: 'current-user',
    name: 'Jordan',
    handle: '@jordan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    banner: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=2607&auto=format&fit=crop',
    followersCount: 142,
    followsCount: 89,
    postsCount: 45
};

const USERS: User[] = [
    currentUser,
    {
        id: 'user-1',
        name: 'Sarah Wilson',
        handle: '@sarah.w',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        banner: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2670&auto=format&fit=crop',
        followersCount: 1250,
        followsCount: 420,
        postsCount: 312
    },
    {
        id: 'user-2',
        name: 'Tech Insider',
        handle: '@tech.insider',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
        banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop',
        followersCount: 54200,
        followsCount: 12,
        postsCount: 1540
    },
    {
        id: 'user-3',
        name: 'Alex Chen',
        handle: '@alex.c',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop',
        followersCount: 890,
        followsCount: 950,
        postsCount: 124
    },
    {
        id: 'user-4',
        name: 'Nature Daily',
        handle: '@nature.daily',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nature',
        banner: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop',
        followersCount: 12000,
        followsCount: 50,
        postsCount: 890
    }
];

const CONTENT_SNIPPETS = [
    "Just had the best coffee ever! ☕️",
    "Working on a new project, super excited to share it soon. 🚀",
    "Can't believe it's already Friday. Time flies!",
    "Anyone else watching the new season of that show?",
    "Beautiful sunset today. 🌅",
    "Coding all night long. #developer #life",
    "Just learned a new trick in React. Mind blown. 🤯",
    "Pizza for dinner? Yes please! 🍕",
    "Hiking trip this weekend was amazing.",
    "Reading a great book right now.",
    "Why is CSS so hard sometimes? 😅",
    "Check out this cool article I found.",
    "Thinking about adopting a cat. 🐱",
    "Music is life. 🎵",
    "Good morning everyone! Have a great day.",
];

const IMAGES = [
    'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    'https://images.unsplash.com/photo-1682687221038-404670e01d46',
    'https://images.unsplash.com/photo-1682687220063-4742bd7fd538',
    'https://images.unsplash.com/photo-1682687220199-d0124f48f95b',
    'https://images.unsplash.com/photo-1682687220067-dced9a881b56',
];

export const generatePosts = (count: number): Post[] => {
    const posts: Post[] = [];
    let postIdCounter = 0;

    for (let i = 0; i < count; i++) {
        const user = USERS[Math.floor(Math.random() * USERS.length)];
        const content = CONTENT_SNIPPETS[Math.floor(Math.random() * CONTENT_SNIPPETS.length)];
        const hasImage = Math.random() > 0.8; // 20% chance of image

        // Generate a timestamp within the last 7 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 7));
        date.setHours(Math.floor(Math.random() * 24));
        date.setMinutes(Math.floor(Math.random() * 60));

        const post: Post = {
            id: `p${postIdCounter++}`,
            author: user,
            content: content,
            image: hasImage ? IMAGES[Math.floor(Math.random() * IMAGES.length)] : undefined,
            likes: Math.floor(Math.random() * 100),
            replies: 0, // Will be updated if threads are generated
            reposts: Math.floor(Math.random() * 10),
            timestamp: date.toISOString(),
        };

        posts.push(post);

        // 15% chance to generate a thread
        if (Math.random() < 0.15) {
            const replyCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 replies
            post.replies = replyCount;

            for (let j = 0; j < replyCount; j++) {
                const replyUser = USERS[Math.floor(Math.random() * USERS.length)];
                const replyContent = CONTENT_SNIPPETS[Math.floor(Math.random() * CONTENT_SNIPPETS.length)];

                // Reply timestamp slightly after parent
                const replyDate = new Date(date);
                replyDate.setMinutes(replyDate.getMinutes() + (j + 1) * 5);

                posts.push({
                    id: `p${postIdCounter++}`,
                    author: replyUser,
                    content: replyContent,
                    likes: Math.floor(Math.random() * 50),
                    replies: 0,
                    reposts: Math.floor(Math.random() * 5),
                    timestamp: replyDate.toISOString(),
                    parentId: post.id,
                });
            }
        }
    }
    // Sort by newest first
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const MOCK_POSTS = generatePosts(250);
