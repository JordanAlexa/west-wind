import { Link } from '@tanstack/react-router';

interface RichTextProps {
    content: string;
    className?: string;
}

export const RichText = ({ content, className = '' }: RichTextProps) => {
    if (!content) return null;

    // Split by hashtags, keeping the delimiter
    const parts = content.split(/(#[\w]+)/g);

    return (
        <p className={`whitespace-pre-wrap ${className}`}>
            {parts.map((part, index) => {
                if (part.match(/^#[\w]+$/)) {
                    const tag = part.substring(1); // Remove #
                    return (
                        <Link
                            key={index}
                            to="/hashtag/$tag"
                            params={{ tag: tag.toLowerCase() }}
                            className="text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </Link>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </p>
    );
};
