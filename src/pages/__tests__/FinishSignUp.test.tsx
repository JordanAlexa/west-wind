import { render, screen, waitFor } from '@testing-library/react';
import { FinishSignUp } from '../FinishSignUp';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Hoist mocks
const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
    signInWithEmailLink: vi.fn(),
    setUser: vi.fn(),
    updateProfile: vi.fn(),
    apiPost: vi.fn().mockResolvedValue({ url: 'http://avatar.url' }),
    loginWithIdToken: vi.fn().mockResolvedValue({}),
    idbGet: vi.fn(),
    idbDel: vi.fn(),
    idbSet: vi.fn(),
}));

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => mocks.navigate,
}));

vi.mock('sonner', () => ({
    toast: mocks.toast,
}));

vi.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader">Loader</div>,
}));

vi.mock('../../features/auth/stores/authStore', () => ({
    useAuthStore: () => ({
        signInWithEmailLink: mocks.signInWithEmailLink,
        user: null,
        setUser: mocks.setUser,
    }),
}));

vi.mock('../../lib/firebase', () => ({
    auth: {
        currentUser: {
            uid: 'test-uid',
            getIdToken: vi.fn().mockResolvedValue('test-token'),
        },
    },
}));

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/auth')>();
    return {
        ...actual,
        updateProfile: mocks.updateProfile,
    };
});

vi.mock('idb-keyval', () => ({
    get: mocks.idbGet,
    del: mocks.idbDel,
    set: mocks.idbSet,
}));

vi.mock('@/lib/api-client', () => ({
    api: {
        post: mocks.apiPost,
    },
}));

vi.mock('../../features/auth/api/login', () => ({
    loginWithIdToken: mocks.loginWithIdToken,
}));

describe('FinishSignUp Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
        Object.defineProperty(window, 'location', {
            value: {
                href: 'http://localhost:3000/finishSignUp?apiKey=123',
                origin: 'http://localhost:3000',
            },
            writable: true,
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('redirects to home if no email in localStorage', async () => {
        render(<FinishSignUp />);

        await waitFor(() => {
            expect(mocks.toast.error).toHaveBeenCalledWith(expect.stringContaining('No email found'));
        });
    });

    it('calls signInWithEmailLink when email exists', async () => {
        window.localStorage.setItem('emailForSignIn', 'test@example.com');

        render(<FinishSignUp />);

        await waitFor(() => {
            expect(mocks.signInWithEmailLink).toHaveBeenCalledWith('test@example.com', expect.stringContaining('http://localhost'));
        });

        await waitFor(() => {
            expect(mocks.toast.success).toHaveBeenCalledWith('Successfully signed in!');
            expect(mocks.navigate).toHaveBeenCalledWith({ to: '/' });
        });
    });

    it('handles pending registration data correctly', async () => {
        window.localStorage.setItem('emailForSignIn', 'test@example.com');
        window.localStorage.setItem('pendingRegistration', JSON.stringify({
            username: 'newuser',
            display_name: 'New User'
        }));

        render(<FinishSignUp />);

        await waitFor(() => {
            expect(mocks.signInWithEmailLink).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mocks.updateProfile).toHaveBeenCalledWith('test-uid', {
                username: 'newuser',
            });
        });

        await waitFor(() => {
            expect(window.localStorage.getItem('pendingRegistration')).toBeNull();
            expect(mocks.navigate).toHaveBeenCalledWith({ to: '/' });
        });
    });

    it('handles invalid action code error', async () => {
        window.localStorage.setItem('emailForSignIn', 'test@example.com');
        
        // Mock error
        const error: any = new Error('Invalid code');
        error.code = 'auth/invalid-action-code';
        mocks.signInWithEmailLink.mockRejectedValueOnce(error);

        render(<FinishSignUp />);

        await waitFor(() => {
            expect(mocks.toast.error).toHaveBeenCalledWith(expect.stringContaining('expired or has already been used'));
        });
    });

    it('handles email already in use error', async () => {
        window.localStorage.setItem('emailForSignIn', 'test@example.com');
        
        // Mock error
        const error: any = new Error('Email taken');
        error.code = 'auth/email-already-in-use';
        mocks.signInWithEmailLink.mockRejectedValueOnce(error);

        render(<FinishSignUp />);

        await waitFor(() => {
            expect(mocks.toast.error).toHaveBeenCalledWith(expect.stringContaining('already associated with an account'));
        });
    });

    it('handles quota exceeded error', async () => {
        window.localStorage.setItem('emailForSignIn', 'test@example.com');
        
        // Mock error
        const error: any = new Error('QUOTA_EXCEEDED : Exceeded daily quota');
        mocks.signInWithEmailLink.mockRejectedValueOnce(error);

        render(<FinishSignUp />);

        await waitFor(() => {
            expect(mocks.toast.error).toHaveBeenCalledWith(expect.stringContaining('Daily sign-in limit reached'));
        });
    });
});
