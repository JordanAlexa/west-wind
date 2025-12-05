import { useEffect, useRef } from 'react';
import * as rrweb from 'rrweb';

const BATCH_SIZE = 50;
const FLUSH_INTERVAL = 5000; // 5 seconds

export function SessionRecorder() {
    const eventsBuffer = useRef<any[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const flushEvents = async () => {
        if (eventsBuffer.current.length === 0) return;

        const eventsToSend = [...eventsBuffer.current];
        eventsBuffer.current = [];

        try {
            await fetch('http://localhost:3000/api/telemetry/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: eventsToSend }),
            });
        } catch (error) {
            console.error('Failed to send session events:', error);
            // Optionally re-queue events on failure, but for now we drop them to avoid memory leaks
        }
    };

    useEffect(() => {
        // Start recording
        const stopFn = rrweb.record({
            emit(event) {
                eventsBuffer.current.push(event);

                if (eventsBuffer.current.length >= BATCH_SIZE) {
                    flushEvents();
                }
            },
        });

        // Periodic flush
        timerRef.current = setInterval(flushEvents, FLUSH_INTERVAL);

        // Flush on unload
        const handleUnload = () => {
            flushEvents();
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            if (stopFn) stopFn();
            if (timerRef.current) clearInterval(timerRef.current);
            window.removeEventListener('beforeunload', handleUnload);
            flushEvents(); // Final flush
        };
    }, []);

    return null; // Renderless component
}
