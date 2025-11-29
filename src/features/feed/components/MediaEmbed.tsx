import React from 'react';

interface MediaEmbedProps {
    src: string;
    alt?: string;
    className?: string;
}

export const MediaEmbed: React.FC<MediaEmbedProps> = ({ src, alt = 'Media content', className = '' }) => {
    const isVideo = src.match(/\.(mp4|mov|webm)$/i);

    if (isVideo) {
        return (
            <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
                <video
                    src={src}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onClick={(e) => e.stopPropagation()} // Prevent navigating to post detail when clicking video controls
                />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
            />
        </div>
    );
};
