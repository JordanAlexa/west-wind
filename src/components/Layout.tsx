import { Home, Search, Bell, Mail, User, PenSquare, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../features/auth/stores/authStore';
import { Link, useLocation } from '@tanstack/react-router';
import { SearchInput } from '../features/search/components/SearchInput';
import { useQuery } from '@tanstack/react-query';
import { getTrendingHashtags } from '../features/feed/api/hashtags';
import { useUnreadCount } from '../features/notifications/hooks/useNotifications';

interface LayoutProps {
    children: React.ReactNode;
    onNewPost: () => void;
}

export const Layout = ({ children, onNewPost }: LayoutProps) => {
    const { user, signOut } = useAuthStore();
    const { data: unreadCount } = useUnreadCount();

    const location = useLocation();

    const NavItem = ({ icon: Icon, label, to, params, active = false, badge }: { icon: any, label: string, to: string, params?: any, active?: boolean, badge?: number }) => {
        const isActive = active || (to !== '/' && location.pathname.startsWith(to)) || (to === '/' && location.pathname === '/');

        return (
            <Link
                to={to}
                params={params}
                className={`flex items-center gap-4 p-3 w-full rounded-full transition-colors relative ${isActive ? 'font-bold bg-surface-hover' : 'hover:bg-surface-hover'
                    }`}
            >
                <div className="relative">
                    <Icon className={`w-7 h-7 ${isActive ? 'stroke-[3px]' : 'stroke-[2px]'}`} />
                    {badge && badge > 0 ? (
                        <div className="absolute -top-1 -right-1 bg-[#8B5CF6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center items-center border-2 border-white">
                            {badge > 99 ? '99+' : badge}
                        </div>
                    ) : null}
                </div>
                <span className="text-xl hidden xl:block">{label}</span>
            </Link>
        )
    };

    return (
        <div className="min-h-screen bg-bg text-text">
            <div className="max-w-[1300px] mx-auto flex justify-center">
                {/* Left Sidebar - Desktop */}
                <header className="hidden md:flex flex-col w-[88px] xl:w-[275px] h-screen sticky top-0 border-r border-border px-2 py-4">
                    <div className="mb-6 px-3">
                        {/* Logo removed as per request */}
                    </div>

                    <nav className="flex-1 flex flex-col gap-2">
                        <NavItem icon={Home} label="Home" to="/" />
                        {/* Search removed from left sidebar */}
                        <NavItem
                            icon={Bell}
                            label="Notifications"
                            to="/notifications"
                            badge={unreadCount}
                        />
                        {/* <NavItem icon={Mail} label="Messages" to="/" /> */}
                        <NavItem
                            icon={User}
                            label="Profile"
                            to="/profile/$handle"
                            params={{ handle: user?.email ? `@${user.email.split('@')[0]}` : 'me' }}
                            active={location.pathname.startsWith('/profile')}
                        />
                        <NavItem icon={Settings} label="Settings" to="/settings" />

                        <button
                            onClick={onNewPost}
                            aria-label="New Post"
                            className="mt-4 bg-primary hover:bg-primary/90 text-white rounded-full p-3 xl:py-3 xl:px-8 flex items-center justify-center transition-all shadow-sm font-bold text-[17px]"
                        >
                            <PenSquare className="w-6 h-6 xl:hidden" />
                            <span className="hidden xl:block">New Post</span>
                        </button>
                    </nav>

                    <div className="mt-auto">
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-4 p-3 w-full rounded-full hover:bg-surface-hover transition-colors"
                        >
                            <LogOut className="w-7 h-7" />
                            <span className="text-xl hidden xl:block">Sign out</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 max-w-[600px] w-full border-r border-border min-h-screen pb-16 md:pb-0">
                    {children}
                </main>

                {/* Right Sidebar - Desktop Placeholder */}
                <aside className="hidden lg:block w-[350px] pl-8 py-4 sticky top-0 h-screen">
                    <div className="mb-6">
                        <SearchInput placeholder="Search West Wind" />
                    </div>

                    <div className="bg-surface rounded-2xl p-4">
                        <h2 className="font-bold text-xl mb-4">What's happening</h2>
                        <TrendingHashtags />
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Nav & FAB */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bg border-t border-border px-4 py-3 flex justify-between items-center z-40">
                <Link to="/">
                    <Home className="w-7 h-7" />
                </Link>
                <Link to="/search">
                    <Search className="w-7 h-7" />
                </Link>
                <Link to="/notifications" className="relative">
                    <Bell className="w-7 h-7" />
                    {unreadCount && unreadCount > 0 ? (
                        <div className="absolute -top-1 -right-1 bg-[#8B5CF6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center items-center border-2 border-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    ) : null}
                </Link>
                <Mail className="w-7 h-7" />
            </div>

            <button
                onClick={onNewPost}
                aria-label="New Post"
                className="md:hidden fixed bottom-20 right-4 bg-primary text-white rounded-full p-4 shadow-lg z-50 hover:bg-primary/90 transition-all"
            >
                <PenSquare className="w-6 h-6" />
            </button>
        </div>
    );
};

const TrendingHashtags = () => {
    const { data: hashtags } = useQuery({
        queryKey: ['trending-hashtags'],
        queryFn: getTrendingHashtags,
    });

    if (!hashtags || hashtags.length === 0) {
        return <div className="text-muted text-sm">No trending topics yet.</div>;
    }

    return (
        <div className="space-y-4">
            {hashtags.map((tag) => (
                <Link
                    key={tag.tag}
                    to="/hashtag/$tag"
                    params={{ tag: tag.tag }}
                    className="block hover:bg-surface-hover -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                    <div className="text-muted text-xs">Trending</div>
                    <div className="font-bold">#{tag.tag}</div>
                    <div className="text-muted text-xs">{tag.count} posts</div>
                </Link>
            ))}
        </div>
    );
};
