import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../theme/ThemeProvider';

import { SessionRecorder } from '@/features/telemetry/SessionRecorder';

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <SessionRecorder />
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}
