

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
    const tabs = [
        { id: 'posts', label: 'Posts' },
        { id: 'replies', label: 'Replies' },
        { id: 'media', label: 'Media' },
        { id: 'videos', label: 'Videos' },
        { id: 'likes', label: 'Likes' },
    ];

    return (
        <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        flex-1 min-w-[80px] py-3 text-sm font-medium hover:bg-surface-hover transition-colors relative
                        ${activeTab === tab.id ? 'text-text font-bold' : 'text-muted'}
                    `}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
    );
};
