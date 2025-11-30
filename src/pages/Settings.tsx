import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Layout } from '../components/Layout';
import { usePreferencesStore, type Theme, type FontSize } from '../features/preferences/stores/preferencesStore';
import { useAuthStore } from '../features/auth/stores/authStore';
import { toast } from 'sonner';

export function Settings() {
    const [activeTab, setActiveTab] = useState<'account' | 'appearance'>('appearance');

    return (
        <Layout onNewPost={() => { }}>
            <div className="w-full max-w-[600px] mx-auto min-h-screen bg-bg text-text">
                <div className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-border px-4 py-3">
                    <h1 className="text-xl font-bold">Settings</h1>
                </div>

                <div className="flex border-b border-border">
                    <button
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'account' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-text'
                            }`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-text'
                            }`}
                        onClick={() => setActiveTab('appearance')}
                    >
                        Appearance
                    </button>
                </div>

                <div className="p-4">
                    {activeTab === 'account' ? <AccountSettings /> : <AppearanceSettings />}
                </div>
            </div>
        </Layout>
    );
}

function AccountSettings() {
    const { user } = useAuthStore();
    const [handle, setHandle] = useState(user?.email?.split('@')[0] || '');

    const handleSave = () => {
        toast.success('Handle updated successfully (Mock)');
    };

    return (
        <div className="space-y-6">
            <section>
                <h2 className="text-lg font-bold mb-4">Change Handle</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-500">Current Handle</label>
                        <div className="p-3 bg-gray-100 rounded-lg text-gray-700">
                            @{user?.email?.split('@')[0] || 'username'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">New Handle</label>
                        <div className="flex gap-2">
                            <span className="py-2 text-gray-500">@</span>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="flex-1 bg-transparent border-b border-border py-2 focus:outline-none focus:border-primary"
                                placeholder="Enter new handle"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-primary text-white px-4 py-2 rounded-full font-bold hover:opacity-90 transition-opacity"
                    >
                        Save Changes
                    </button>
                </div>
            </section>
        </div>
    );
}

function AppearanceSettings() {
    const { theme, setTheme, font, setFont, fontSize, setFontSize } = usePreferencesStore();
    const navigate = useNavigate();

    const handleSave = () => {
        navigate({ to: '/' });
    };

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-bold mb-4">Color Mode</h2>
                <div className="grid grid-cols-3 gap-3">
                    <ThemeOption
                        label="Light"
                        value="light"
                        current={theme}
                        onSelect={setTheme}
                        previewClass="bg-white text-black border-gray-200"
                    />
                    <ThemeOption
                        label="Dark"
                        value="dark"
                        current={theme}
                        onSelect={setTheme}
                        previewClass="bg-black text-white border-gray-800"
                    />
                    <ThemeOption
                        label="LCARS"
                        value="lcars"
                        current={theme}
                        onSelect={setTheme}
                        previewClass="bg-black text-[#FF9900] border-[#FF9900]"
                    />
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-4">Font</h2>
                <div className="space-y-2">
                    <RadioOption label="System" value="system" current={font} onSelect={setFont} />
                    <RadioOption label="Inter" value="inter" current={font} onSelect={setFont} style={{ fontFamily: 'Inter, sans-serif' }} />
                    <RadioOption label="Lato" value="lato" current={font} onSelect={setFont} style={{ fontFamily: 'Lato, sans-serif' }} />
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-4">Font Size</h2>
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                    {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map((size) => (
                        <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${fontSize === size
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary'
                                : 'text-gray-500 hover:text-text'
                                }`}
                        >
                            {size.toUpperCase()}
                        </button>
                    ))}
                </div>
            </section>

            <div className="pt-4 border-t border-border">
                <button
                    onClick={handleSave}
                    className="w-full bg-primary text-white py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function ThemeOption({ label, value, current, onSelect, previewClass }: { label: string, value: Theme, current: Theme, onSelect: (t: Theme) => void, previewClass: string }) {
    return (
        <button
            onClick={() => onSelect(value)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${current === value ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <div className={`w-full aspect-video rounded-lg border ${previewClass} flex items-center justify-center text-xs font-bold`}>
                Aa
            </div>
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
}

function RadioOption({ label, value, current, onSelect, style }: { label: string, value: any, current: any, onSelect: (v: any) => void, style?: React.CSSProperties }) {
    return (
        <button
            onClick={() => onSelect(value)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
            <span className="font-medium" style={style}>{label}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${current === value ? 'border-primary' : 'border-gray-300'
                }`}>
                {current === value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
        </button>
    );
}
