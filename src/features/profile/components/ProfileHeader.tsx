import { useState } from 'react';
import { useAuthStore } from '../../auth/stores/authStore';
import { EditProfileModal } from './EditProfileModal';
import { type User } from '../../profile/api/users';
import { useFollow } from '../hooks/useFollow';

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
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-bg bg-bg overflow-hidden">
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
                            className="bg-surface border border-border text-text px-4 py-1.5 rounded-full text-sm font-bold hover:bg-surface-hover transition-colors mt-12 sm:mt-0"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <FollowButton user={user} />
                    )}
                </div>

                {/* User Info */}
                <div>
                    <h1 className="text-2xl font-bold text-text leading-tight">{user.name}</h1>
                    <div className="flex items-center gap-2 text-muted text-sm">
                        <span>{user.handle}</span>
                        {/* <span className="bg-gray-100 px-1.5 rounded text-xs">follows you</span> */}
                    </div>
                    {user.bio && (
                        <p className="mt-2 text-text text-sm whitespace-pre-wrap">{user.bio}</p>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-text">{user.followersCount || 0}</span>
                        <span className="text-muted ml-1">followers</span>
                    </div>
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-text">{user.followsCount || 0}</span>
                        <span className="text-muted ml-1">following</span>
                    </div>
                    <div className="hover:underline cursor-pointer">
                        <span className="font-bold text-text">{user.postsCount || 0}</span>
                        <span className="text-muted ml-1">posts</span>
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

const FollowButton = ({ user }: { user: User }) => {
    const { toggleFollow, isPending } = useFollow(user);
    const isFollowing = user.isFollowedByViewer;

    return (
        <button
            onClick={() => toggleFollow()}
            disabled={isPending}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors mt-12 sm:mt-0 ${isFollowing
                ? 'bg-surface border border-border text-text hover:bg-red-50 hover:text-red-600 hover:border-red-200 group'
                : 'bg-primary text-white hover:opacity-90'
                }`}
        >
            <span className={isFollowing ? 'group-hover:hidden' : ''}>
                {isFollowing ? 'Following' : 'Follow'}
            </span>
            {isFollowing && (
                <span className="hidden group-hover:inline">Unfollow</span>
            )}
        </button>
    );
};
