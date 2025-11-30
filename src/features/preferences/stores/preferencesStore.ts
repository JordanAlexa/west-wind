import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'lcars';
export type Font = 'system' | 'inter' | 'lato';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface PreferencesState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    font: Font;
    setFont: (font: Font) => void;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    mutedThreads: string[];
    toggleMutedThread: (threadId: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            theme: 'light',
            setTheme: (theme) => set({ theme }),
            font: 'system',
            setFont: (font) => set({ font }),
            fontSize: 'md',
            setFontSize: (fontSize) => set({ fontSize }),
            mutedThreads: [],
            toggleMutedThread: (threadId) =>
                set((state) => {
                    const isMuted = state.mutedThreads.includes(threadId);
                    return {
                        mutedThreads: isMuted
                            ? state.mutedThreads.filter((id) => id !== threadId)
                            : [...state.mutedThreads, threadId],
                    };
                }),
        }),
        {
            name: 'preferences-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
