import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Camera } from 'lucide-react';
import { updateProfile } from '../api/users';
import { uploadImage } from '../../../lib/api/upload';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { ProfileSchema } from '../../../lib/schemas';
import { z } from 'zod';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    currentProfile: any;
}

export const EditProfileModal = ({ isOpen, onClose, currentUser, currentProfile }: EditProfileModalProps) => {
    // Media State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    // Refs for hidden file inputs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (data: { display_name: string; bio: string }) => {
            let avatarUrl = undefined;
            let bannerUrl = undefined;

            // Upload images if selected
            try {
                if (avatarFile) {
                    avatarUrl = await uploadImage(avatarFile);
                }
                if (bannerFile) {
                    bannerUrl = await uploadImage(bannerFile);
                }
            } catch (err: any) {
                console.error('Image upload failed:', err);
                const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to upload image.';
                throw new Error(errorMessage);
            }

            return updateProfile(currentUser.uid, {
                ...data,
                avatar_url: avatarUrl,
                banner_url: bannerUrl
            });
        },
        onSuccess: () => {
            // Invalidate profile query (both with and without @ to be safe)
            queryClient.invalidateQueries({ queryKey: ['profile', currentProfile.username] });
            queryClient.invalidateQueries({ queryKey: ['profile', `@${currentProfile.username}`] });

            // Also invalidate current user query to update header avatar immediately
            queryClient.invalidateQueries({ queryKey: ['user', currentUser.uid] });

            // Invalidate feed to update avatar in posts
            queryClient.invalidateQueries({ queryKey: ['posts'] });

            onClose();
        },
        onError: (error) => {
            console.error('Profile update failed:', error);
            setError(error instanceof Error ? error.message : 'Failed to update profile');
        },
    });

    const formik = useFormik({
        initialValues: {
            display_name: currentProfile.display_name || '',
            bio: currentProfile.bio || '',
        },
        validationSchema: toFormikValidationSchema(ProfileSchema),
        onSubmit: (values: z.infer<typeof ProfileSchema>) => {
            mutation.mutate({
                ...values,
                bio: values.bio || ''
            });
        },
    });

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        if (type === 'avatar') {
            setAvatarFile(file);
            setAvatarPreview(previewUrl);
        } else {
            setBannerFile(file);
            setBannerPreview(previewUrl);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={formik.handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <h2 className="text-base font-bold text-gray-900">Edit Profile</h2>
                        <button
                            type="submit"
                            disabled={mutation.isPending || !formik.isValid}
                            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center border-b border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Hidden File Inputs */}
                    <input
                        type="file"
                        ref={avatarInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                    />
                    <input
                        type="file"
                        ref={bannerInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileChange(e, 'banner')}
                    />

                    {/* Banner Placeholder */}
                    <div
                        className="h-32 bg-blue-500 relative group cursor-pointer"
                        onClick={() => bannerInputRef.current?.click()}
                    >
                        {(bannerPreview || currentProfile.banner_url) ? (
                            <img
                                src={bannerPreview || currentProfile.banner_url}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600" />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Avatar Placeholder */}
                    <div className="px-4 -mt-10 mb-4 relative">
                        <div
                            className="relative inline-block group cursor-pointer"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                                <img
                                    src={avatarPreview || currentProfile.avatar_url || `https://ui-avatars.com/api/?name=${currentProfile.username}`}
                                    alt={currentProfile.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="px-4 pb-6 space-y-4">
                        <div>
                            <label htmlFor="display_name" className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Display Name
                            </label>
                            <input
                                id="display_name"
                                type="text"
                                className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formik.touched.display_name && formik.errors.display_name ? 'ring-2 ring-red-500' : ''}`}
                                placeholder="e.g. Alice Roberts"
                                {...formik.getFieldProps('display_name')}
                            />
                            {formik.touched.display_name && formik.errors.display_name && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.display_name}</div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="bio" className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Description
                            </label>
                            <textarea
                                id="bio"
                                className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-24 ${formik.touched.bio && formik.errors.bio ? 'ring-2 ring-red-500' : ''}`}
                                placeholder="e.g. Artist, dog-lover, and avid reader."
                                {...formik.getFieldProps('bio')}
                            />
                            {formik.touched.bio && formik.errors.bio && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.bio}</div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
