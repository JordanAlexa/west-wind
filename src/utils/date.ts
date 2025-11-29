import { format, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export const formatRelativeTime = (date: Date | string | number): string => {
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = differenceInSeconds(now, d);

    if (diffInSeconds < 60) {
        return 'now';
    }

    const diffInMinutes = differenceInMinutes(now, d);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
    }

    const diffInHours = differenceInHours(now, d);
    if (diffInHours < 24) {
        return `${diffInHours}h`;
    }

    const diffInDays = differenceInDays(now, d);
    if (diffInDays < 7) {
        return `${diffInDays}d`;
    }

    if (d.getFullYear() === now.getFullYear()) {
        return format(d, 'MMM d');
    }

    return format(d, 'MMM d, yyyy');
};
