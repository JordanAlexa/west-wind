import { useState } from 'react';
import { useAuthStore } from '../../auth/stores/authStore';
import { EditProfileModal } from './EditProfileModal';
import { type User } from '../../profile/api/users';

interface ProfileHeaderProps {
    user: User;
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
    const { user: currentUser } = useAuthStore();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Check if the current logged-in user is viewing their own profile
    const isOwnProfile = currentUser && (
        user.firebase_uid === currentUser.uid ||
        user.handle === `@${currentUser.displayName}` ||
        user.handle === currentUser.displayName
    );

    return (
        <div className="relative">
            {/* Banner */}
            <div className="h-32 sm:h-48 bg-gray-200 w-full overflow-hidden">
                {user.banner ? (
                    <img
                        src={user.banner}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600" />
                )}
            </div>

            <div className="px-4 pb-4">
                <div className="flex justify-between items-end -mt-10 sm:-mt-12 mb-3">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white overflow-hidden">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    {isOwnProfile ? (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-gray-200 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-300 transition-colors mt-12 sm:mt-0"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors mt-12 sm:mt-0">
                            Follow
                        </button>
                    )}
                </div>

                {/* User Info */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{user.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>{user.handle}</span>
                        {/* <span className="bg-gray-100 px-1.5 rounded text-xs">follows you</span> */}
                    </div>
                    {user.bio && (
                        <p className="mt-2 text-gray-900 text-sm whitespace-pre-wrap">{user.bio}</p>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-gray-900">{user.followersCount || 0}</span>
                        <span className="text-gray-500 ml-1">followers</span>
                    </div>
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-gray-900">{user.followsCount || 0}</span>
                        <span className="text-gray-500 ml-1">following</span>
                    </div>
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-gray-900">{user.postsCount || 0}</span>
                        <span className="text-gray-500 ml-1">posts</span>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {currentUser && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentUser={currentUser}
                    currentProfile={{
                        username: user.handle ? user.handle.replace('@', '') : '',
                        display_name: user.name,
                        bio: user.bio,
                        avatar_url: user.avatar,
                        banner_url: user.banner
                    }}
                />
            )}
        </div>
    );
};
