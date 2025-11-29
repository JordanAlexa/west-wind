import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Composer } from './Composer';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a wrapper for QueryClientProvider
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock alert
global.alert = vi.fn();

describe('Composer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<Composer />, { wrapper: createWrapper() });
        expect(screen.getByPlaceholderText("What's up?")).toBeInTheDocument();
        expect(screen.getByTitle('Image')).toBeInTheDocument();
        expect(screen.getByTitle('GIF')).toBeInTheDocument();
    });

    it('allows typing text', () => {
        render(<Composer />, { wrapper: createWrapper() });
        const textarea = screen.getByPlaceholderText("What's up?");
        fireEvent.change(textarea, { target: { value: 'Hello world' } });
        expect(textarea).toHaveValue('Hello world');
    });

    it('disables post button when empty', () => {
        render(<Composer />, { wrapper: createWrapper() });
        const postButton = screen.getByText('Post');
        expect(postButton).toBeDisabled();
    });

    it('enables post button when text is entered', () => {
        render(<Composer />, { wrapper: createWrapper() });
        const textarea = screen.getByPlaceholderText("What's up?");
        fireEvent.change(textarea, { target: { value: 'Hello world' } });
        const postButton = screen.getByText('Post');
        expect(postButton).not.toBeDisabled();
    });

    it('handles image selection', async () => {
        render(<Composer />, { wrapper: createWrapper() });
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByTestId('image-input');

        fireEvent.change(input, { target: { files: [file] } });

        expect(global.URL.createObjectURL).toHaveBeenCalled();
        // Check if preview is rendered (we might need to wait for state update)
        await waitFor(() => {
            expect(screen.getByAltText('Preview 0')).toBeInTheDocument();
        });
    });


});
