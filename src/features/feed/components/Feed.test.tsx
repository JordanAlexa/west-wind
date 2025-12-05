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
    Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
    useRouter: () => ({ state: { location: { pathname: '/' } } }),
    useParams: () => ({}),
}));

class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

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
        vi.mocked(ReactQuery.useInfiniteQuery).mockReturnValue({
            status: 'pending',
            data: undefined,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            // Add other required properties with defaults or mocks
            error: null,
            isPending: true,
            isLoading: true,
            isError: false,
            isSuccess: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
            isFetching: false,
            isLoadingError: false,
            isRefetching: false,
            isRefetchError: false,
            isStale: false,
            refetch: vi.fn(),
            promise: Promise.resolve({} as unknown),
        } as unknown as ReactQuery.UseInfiniteQueryResult);
        render(<Feed />, { wrapper: createWrapper() });
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders posts after loading', async () => {
        vi.mocked(ReactQuery.useInfiniteQuery).mockReturnValue({
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
            // Add other required properties
            error: null,
            isPending: false,
            isLoading: false,
            isError: false,
            isSuccess: true,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
            isFetching: false,
            isLoadingError: false,
            isRefetching: false,
            isRefetchError: false,
            isStale: false,
            refetch: vi.fn(),
            promise: Promise.resolve({} as unknown),
        } as unknown as ReactQuery.UseInfiniteQueryResult);
        render(<Feed />, { wrapper: createWrapper() });

        expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
});
