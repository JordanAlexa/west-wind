import { render, screen } from '@testing-library/react';
import { Feed } from './Feed';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ReactQuery from '@tanstack/react-query';

// Mock useInfiniteQuery
vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useInfiniteQuery: vi.fn(),
    };
});

// Mock @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
    useRouter: () => ({ state: { location: { pathname: '/' } } }),
    useParams: () => ({}),
}));

class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver as any;

// Create a wrapper for QueryClientProvider (still needed for context, though we mock the hook)
const createWrapper = () => {
    const queryClient = new ReactQuery.QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <ReactQuery.QueryClientProvider client={queryClient}>
            {children}
        </ReactQuery.QueryClientProvider>
    );
};

describe('Feed', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (ReactQuery.useInfiniteQuery as any).mockReturnValue({
            status: 'pending',
            data: undefined,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        });
        render(<Feed />, { wrapper: createWrapper() });
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders posts after loading', async () => {
        (ReactQuery.useInfiniteQuery as any).mockReturnValue({
            status: 'success',
            data: {
                pages: [{
                    posts: [{
                        id: '1',
                        content: 'Hello world',
                        author: {
                            id: '1',
                            name: 'Alice Johnson',
                            handle: 'alice',
                            avatar: 'https://example.com/avatar.png',
                            banner: '',
                            followersCount: 100,
                            followsCount: 50,
                            postsCount: 10,
                        },
                        timestamp: new Date().toISOString(),
                        likes: 0,
                        replies: 0,
                        reposts: 0,
                    }],
                    nextCursor: null
                }],
                pageParams: [0]
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        });
        render(<Feed />, { wrapper: createWrapper() });

        expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
});
