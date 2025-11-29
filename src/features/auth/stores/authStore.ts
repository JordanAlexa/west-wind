import { create } from 'zustand';
import { type User, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../../../lib/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    setUser: (user: User | null) => void;
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

            // Sync with backend
            try {
                await fetch('http://localhost:3000/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firebase_uid: user.uid,
                        email: user.email,
                        username: user.email?.split('@')[0] || 'user' + user.uid.slice(0, 5),
                        display_name: user.displayName,
                        avatar_url: user.photoURL
                    })
                });

                // Save to local storage for API usage
                localStorage.setItem('west-wind-user', JSON.stringify(user));

            } catch (apiError) {
                console.error('Failed to sync user with backend:', apiError);
            }

            set({ user, loading: false });
        } catch (error: any) {
            console.error("Sign In Error:", error);
            set({ error: error.message, loading: false });
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
