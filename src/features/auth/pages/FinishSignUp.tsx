import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';

export const FinishSignUp = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying your email...');
    const { signInWithEmailLink, user } = useAuthStore();

    // Actually, let's use a ref to track if we are currently processing the sign-up
    // to prevent the 'user' check from redirecting prematurely.
    const isProcessing = useRef(false);

    useEffect(() => {
        const finishSignUp = async () => {
            // If we are already processing, do nothing.
            if (isProcessing.current) return;

            // If user is already logged in AND we are not processing, redirect.
            // This handles the case where a user manually navigates here while logged in.
            if (user && !isProcessing.current) {
                navigate({ to: '/' });
                return;
            }

            const email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                setStatus('Error: No email found. Please try logging in again.');
                toast.error('No email found. Please try logging in again.');
                setTimeout(() => navigate({ to: '/' }), 3000);
                return;
            }

            try {
                isProcessing.current = true;
                setStatus('Signing you in...');
                await signInWithEmailLink(email, window.location.href);

                // Check for pending registration data
                const pendingDataStr = window.localStorage.getItem('pendingRegistration');
                if (pendingDataStr) {
                    setStatus('Setting up your profile...');
                    const pendingData = JSON.parse(pendingDataStr);
                    let avatarUrl = null;

                    // 1. Retrieve avatar from IndexedDB
                    try {
                        const { get, del } = await import('idb-keyval');
                        const avatarFile = await get('pendingAvatar');

                        if (avatarFile && auth.currentUser) {
                            setStatus('Uploading your avatar...');
                            // 2. Upload avatar
                            const formData = new FormData();
                            formData.append('file', avatarFile);

                            // We need to use the api client but it might not have the token yet?
                            // The api client uses the session cookie. loginWithIdToken in App.tsx sets it.
                            // But signInWithEmailLink in authStore calls syncUserWithBackend.
                            // Does syncUserWithBackend set the cookie? No, loginWithIdToken does.
                            // Wait, authStore's signInWithEmailLink calls syncUserWithBackend.
                            // But we need the session cookie for /upload.
                            // We might need to call loginWithIdToken here first?
                            // App.tsx will run when auth state changes.
                            // But we are in a race.
                            // Let's manually ensure we have a session cookie.
                            const idToken = await auth.currentUser.getIdToken();
                            await import('@/features/auth/api/login').then(m => m.loginWithIdToken(idToken));

                            const uploadRes = await import('@/lib/api-client').then(m => m.api.post<{ url: string }>('/upload', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            }));
                            avatarUrl = (uploadRes as any).url;

                            // Cleanup
                            await del('pendingAvatar');
                        }
                    } catch (uploadError) {
                        console.error('Failed to upload avatar:', uploadError);
                        toast.error('Failed to upload avatar, but account created.');
                    }

                    // 3. Sync profile data
                    if (auth.currentUser) {
                        try {
                            await updateProfile(auth.currentUser.uid, {
                                username: pendingData.username,
                            });

                            window.localStorage.removeItem('pendingRegistration');
                        } catch (profileError) {
                            console.error('Failed to update profile:', profileError);
                        }
                    }
                }

                toast.success('Successfully signed in!');
                navigate({ to: '/' });
            } catch (error: any) {
                console.error('Error finishing sign up:', error);
                isProcessing.current = false;

                if (error.code === 'auth/invalid-action-code') {
                    setStatus('Link expired or already used.');
                    toast.error('This sign-in link has expired or has already been used. Please try logging in again.');
                    setTimeout(() => navigate({ to: '/' }), 4000);
                } else if (error.code === 'auth/email-already-in-use') {
                    setStatus('Email already in use.');
                    toast.error('This email is already associated with an account. Please log in.');
                    setTimeout(() => navigate({ to: '/' }), 4000);
                } else if (error.message?.includes('QUOTA_EXCEEDED') || error.code === 'auth/quota-exceeded') {
                    setStatus('Service busy.');
                    toast.error('Daily sign-in limit reached. Please try again tomorrow or use Google Sign-In.');
                    setTimeout(() => navigate({ to: '/' }), 5000);
                } else {
                    setStatus('Error signing in.');
                    toast.error(error.message || 'Error signing in');
                }
            }
        };

        finishSignUp();
    }, [navigate, signInWithEmailLink]); // Removed 'user' from dependency to avoid race condition

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-xl font-semibold text-text">Welcome to West Wind</h2>
                <p className="text-text-secondary font-medium animate-pulse">{status}</p>
            </div>
        </div>
    );
};
