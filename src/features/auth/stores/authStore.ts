import { create } from 'zustand';
import {
    type User,
    signInWithPopup,
    signOut as firebaseSignOut,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signInWithPhoneNumber,
    type ConfirmationResult,
    type ApplicationVerifier,
    // createUserWithEmailAndPassword,
    // updateProfile,
    // sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from '../../../lib/firebase';
import { api } from '@/lib/api-client';

interface AppUser extends User {
    role?: 'SUPER.ADMIN' | 'ADMIN' | 'USER' | 'GUEST';
    username?: string;
    avatar_url?: string | null;
}

interface AuthState {
    user: AppUser | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    sendEmailLink: (email: string) => Promise<void>;
    signInWithEmailLink: (email: string, href: string) => Promise<void>;
    signInWithPhoneNumber: (phoneNumber: string, appVerifier: ApplicationVerifier) => Promise<ConfirmationResult>;
    registerWithEmail: (values: { email: string; username: string; display_name: string; avatar_file?: File | null }) => Promise<void>;
    signOut: () => Promise<void>;
    setUser: (user: AppUser | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,
    signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
            console.log("Starting Google Sign In...");
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log("Sign In Success:", user.email);
            await syncUserWithBackend(user, set);
        } catch (error: any) {
            console.error("Sign In Error:", error);
            set({ error: error.message, loading: false });
        }
    },
    sendEmailLink: async (email: string) => {
        set({ loading: true, error: null });
        try {
            const actionCodeSettings = {
                url: window.location.origin + '/finishSignUp', // We'll handle this route
                handleCodeInApp: true,
            };
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            set({ loading: false });
        } catch (error: any) {
            console.error("Send Email Link Error:", error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },
    signInWithEmailLink: async (email: string, href: string) => {
        set({ loading: true, error: null });
        try {
            if (isSignInWithEmailLink(auth, href)) {
                const result = await signInWithEmailLink(auth, email, href);
                window.localStorage.removeItem('emailForSignIn');
                await syncUserWithBackend(result.user, set);
            }
        } catch (error: any) {
            console.error("Sign In With Email Link Error:", error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },
    signInWithPhoneNumber: async (phoneNumber: string, appVerifier: ApplicationVerifier) => {
        set({ loading: true, error: null });
        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            set({ loading: false });
            return confirmationResult;
        } catch (error: any) {
            console.error("Sign In With Phone Number Error:", error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },
    registerWithEmail: async (values) => {
        // Do not set global loading here, as it unmounts the Register component
        set({ error: null });
        try {
            const { email, username, display_name } = values;

            // 1. Store registration data in localStorage
            // We can't upload the file yet, so we'll have to skip it or handle it later.
            // For now, we'll store the text data.
            const registrationData = {
                email,
                username,
                display_name,
            };
            window.localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));

            // Store avatar file in IndexedDB if present
            if (values.avatar_file) {
                try {
                    const { set } = await import('idb-keyval');
                    await set('pendingAvatar', values.avatar_file);
                } catch (idbError) {
                    console.error('Failed to store avatar in IndexedDB:', idbError);
                    // Continue without avatar persistence
                }
            }

            // 2. Send Email Link
            const actionCodeSettings = {
                url: window.location.origin + '/finishSignUp',
                handleCodeInApp: true,
            };
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);

            // Note: User is NOT created yet. They must click the link.
        } catch (error: any) {
            console.error("Registration Error:", error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },
    signOut: async () => {
        set({ loading: true, error: null });
        try {
            await firebaseSignOut(auth);
            localStorage.removeItem('west-wind-user');
            set({ user: null, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
    setUser: (user) => set({ user, loading: false }),
    setLoading: (loading) => set({ loading }),
}));


// Helper to sync user with backend
export const syncUserWithBackend = async (user: User, set: any, additionalData?: { username?: string; display_name?: string; avatar_url?: string }) => {
    let role = 'USER'; // Default
    const username = additionalData?.username || user.email?.split('@')[0] || 'user' + user.uid.slice(0, 5);
    const avatar_url = additionalData?.avatar_url || user.photoURL;

    try {
        const payload = {
            firebase_uid: user.uid,
            email: user.email,
            username: username,
            display_name: additionalData?.display_name || user.displayName,
            avatar_url: avatar_url,
            email_verified: user.emailVerified
        };

        const data = await api.post<{ role: string }>('/users', payload) as unknown as { role: string };

        if (data.role) {
            role = data.role;
        }

        // Save to local storage for API usage
        localStorage.setItem('west-wind-user', JSON.stringify({ ...user, role }));

    } catch (apiError) {
        console.error('Failed to sync user with backend:', apiError);
    }

    set({
        user: {
            ...user,
            role: role as any,
            username: username,
            avatar_url: avatar_url
        },
        loading: false
    });
};
