import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore, syncUserWithBackend } from '../features/auth/stores/authStore';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export default function Onboarding() {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    
    const [handle, setHandle] = useState('');
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || '');
    const [isCheckingHandle, setIsCheckingHandle] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate({ to: '/register' });
        } else if (!user.incompleteProfile) {
            navigate({ to: '/' });
        }
    }, [user, navigate]);

    useEffect(() => {
        const checkHandle = async () => {
            if (handle.length < 3) {
                setHandleAvailable(null);
                return;
            }
            setIsCheckingHandle(true);
            try {
                const response = await api.get<{ available: boolean }>(`/users/check-handle?handle=${handle}`);
                // @ts-expect-error - api interceptor
                setHandleAvailable(response.available);
            } catch (error) {
                console.error('Failed to check handle:', error);
            } finally {
                setIsCheckingHandle(false);
            }
        };

        const timeoutId = setTimeout(checkHandle, 500);
        return () => clearTimeout(timeoutId);
    }, [handle]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handleAvailable) {
            toast.error('Please choose a valid and available handle');
            return;
        }

        setIsSubmitting(true);
        try {
            if (!user) return;

            // Log telemetry start
            try {
                await api.post('/telemetry/session', {
                    events: [{
                        type: 'onboarding_submit',
                        timestamp: Date.now(),
                        data: { handle, displayName }
                    }]
                });
            } catch (e) { /* ignore telemetry error */ }

            const updatedUser = await syncUserWithBackend(user, {
                username: handle,
                display_name: displayName,
                avatar_url: avatarUrl || undefined
            });

            setUser(updatedUser);
            toast.success('Welcome to West Wind!');
            navigate({ to: '/' });

        } catch (error: any) {
            console.error('Onboarding failed:', error);
            toast.error('Failed to create profile. Please try again.');
            
            // Log telemetry error
            try {
                await api.post('/telemetry/session', {
                    events: [{
                        type: 'onboarding_error',
                        timestamp: Date.now(),
                        data: { error: error.message }
                    }]
                });
            } catch (e) { /* ignore */ }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Complete your profile
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Choose how you'll appear on West Wind
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                                Handle (Username)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">
                                    @
                                </span>
                                <input
                                    type="text"
                                    name="handle"
                                    id="handle"
                                    required
                                    className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border ${
                                        handleAvailable === false ? 'border-red-500' : 
                                        handleAvailable === true ? 'border-green-500' : ''
                                    }`}
                                    placeholder="username"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    {isCheckingHandle && <span className="text-gray-400 text-xs">Checking...</span>}
                                    {!isCheckingHandle && handleAvailable === true && <span className="text-green-500">✓</span>}
                                    {!isCheckingHandle && handleAvailable === false && <span className="text-red-500">Taken</span>}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">
                                Display Name
                            </label>
                            <input
                                type="text"
                                name="display-name"
                                id="display-name"
                                required
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                        {/* Avatar URL input for now, can be upgraded to file upload later */}
                        <div className="mb-4">
                            <label htmlFor="avatar-url" className="block text-sm font-medium text-gray-700">
                                Avatar URL (Optional)
                            </label>
                            <input
                                type="text"
                                name="avatar-url"
                                id="avatar-url"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !handleAvailable}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                isSubmitting || !handleAvailable ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
