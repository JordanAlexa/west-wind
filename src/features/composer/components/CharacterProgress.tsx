import React from 'react';

interface CharacterProgressProps {
    count: number;
    max: number;
}

export const CharacterProgress: React.FC<CharacterProgressProps> = ({ count, max }) => {
    const percentage = Math.min((count / max) * 100, 100);
    const remaining = max - count;
    const isWarning = remaining <= 20;
    const isError = remaining < 0;

    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    let color = 'text-blue-500';
    if (isError) color = 'text-red-500';
    else if (isWarning) color = 'text-yellow-500';

    return (
        <div className="relative flex items-center justify-center w-10 h-10">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-gray-200"
                />
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`${color} transition-all duration-300 ease-in-out`}
                />
            </svg>
            <span className={`absolute text-[10px] font-bold ${isError ? 'text-red-500' : 'text-gray-500'}`}>
                {remaining}
            </span>
        </div>
    );
};
