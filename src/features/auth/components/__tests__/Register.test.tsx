import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Register'; // Default import
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => vi.fn(),
    Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Auth Store
const mockRegisterWithEmail = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock('../../stores/authStore', () => ({
    useAuthStore: () => ({
        registerWithEmail: mockRegisterWithEmail,
        signInWithGoogle: mockSignInWithGoogle,
        loading: false,
        error: null,
    }),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock AvatarUpload
vi.mock('./AvatarUpload', () => ({
    AvatarUpload: () => <div>AvatarUpload Mock</div>,
}));

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders registration form correctly', () => {
        render(<Register />);
        expect(screen.getByText(/create an account/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        // Username is in step 2, so shouldn't be visible yet
        expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<Register />);
        const user = userEvent.setup();

        // Click next without filling anything
        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);

        // Should show validation errors
        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        });
    });

    it('submits form with valid data', async () => {
        render(<Register />);
        const user = userEvent.setup();

        // Fill Stage 1
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /next/i }));

        // Should be on Stage 2 (Bio/Avatar)
        await waitFor(() => {
            expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        });

        // Fill Stage 2
        await user.type(screen.getByLabelText(/username/i), 'testuser');
        await user.type(screen.getByLabelText(/display name/i), 'Test User');
        await user.type(screen.getByLabelText(/date of birth/i), '2000-01-01');

        await user.click(screen.getByRole('button', { name: /next/i }));

        // Should be on Stage 3 (Review)
        await waitFor(() => {
            expect(screen.getByText(/review your details/i)).toBeInTheDocument();
        });

        // Check Terms
        const termsCheckbox = screen.getByRole('checkbox');
        await user.click(termsCheckbox);

        // Submit
        await user.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockRegisterWithEmail).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@example.com',
                username: 'testuser',
                display_name: 'Test User'
            }));
        });
    });
});
