import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../features/feed/pages/Home';
import React from 'react';

// Mock @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => vi.fn(),
    createRouter: vi.fn(),
    createRoute: vi.fn(),
    createRootRoute: vi.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Create a wrapper
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('Home UI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders sidebar and feed', async () => {
        render(<Home />, { wrapper: createWrapper() });

        // Check for Sidebar items (Desktop)
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();

        // Check for Feed
        // Wait for feed to load

        // Check if modal is open
        expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    });
});
