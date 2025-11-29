// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const feedApi = {
    likePost: async (postId: string): Promise<void> => {
        await delay(500); // Simulate network delay
        console.log(`Liked post ${postId}`);
        // In a real app, this would call the backend
    },

    unlikePost: async (postId: string): Promise<void> => {
        await delay(500);
        console.log(`Unliked post ${postId}`);
    },

    repostPost: async (postId: string): Promise<void> => {
        await delay(500);
        console.log(`Reposted post ${postId}`);
    },

    unrepostPost: async (postId: string): Promise<void> => {
        await delay(500);
        console.log(`Unreposted post ${postId}`);
    },
};
