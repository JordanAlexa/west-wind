import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

export const AuthHandler = () => {
    const { signInWithEmailLink } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleEmailLink = async () => {
            if (window.location.href.includes('finishSignUp')) {
                const email = window.localStorage.getItem('emailForSignIn');
                if (!email) {
                    // If email is missing, we could prompt the user for it.
                    // For now, let's just redirect to login with a message.
                    toast.error('Please provide your email again to complete sign in.');
                    navigate({ to: '/' });
                    return;
                }

                try {
                    await signInWithEmailLink(email, window.location.href);
                    toast.success('Successfully signed in!');
                    navigate({ to: '/' });
                } catch (error: any) {
                    toast.error(error.message || 'Failed to sign in with link');
                    navigate({ to: '/' });
                }
            }
        };

        handleEmailLink();
    }, [signInWithEmailLink, navigate]);

    return null;
};
