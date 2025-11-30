import React, { useLayoutEffect } from 'react';
import { usePreferencesStore } from '../features/preferences/stores/preferencesStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, font, fontSize } = usePreferencesStore();

    useLayoutEffect(() => {
        const root = window.document.documentElement;
        // Reset theme classes
        root.classList.remove('light', 'dark', 'lcars');
        root.classList.add(theme);

        // Set font data attribute
        root.setAttribute('data-font', font);

        // Set font size data attribute
        root.setAttribute('data-font-size', fontSize);

    }, [theme, font, fontSize]);

    return <>{children}</>;
}

// Deprecated: Use usePreferencesStore directly
export function useTheme() {
    const { theme, setTheme } = usePreferencesStore();
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light'); // Simple toggle for legacy support
    };
    return { theme, setTheme, toggleTheme };
}
