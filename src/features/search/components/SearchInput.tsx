import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../api/search';

interface SearchInputProps {
    initialValue?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export const SearchInput = ({ initialValue = '', placeholder = 'Search', onSearch }: SearchInputProps) => {
    const [value, setValue] = useState(initialValue);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch user suggestions
    const { data: suggestions } = useQuery({
        queryKey: ['search-suggestions', value],
        queryFn: () => searchUsers(value),
        enabled: !!value && value.length > 1,
    });

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            performSearch(value);
        }
    };

    const performSearch = (query: string) => {
        setShowSuggestions(false);
        if (onSearch) {
            onSearch(query);
        } else {
            navigate({ to: '/search', search: { q: query } });
        }
        inputRef.current?.blur();
    };

    const handleClear = () => {
        setValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        if (value.trim()) {
            setShowSuggestions(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        if (newValue.trim()) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="block w-full pl-10 pr-10 py-2.5 bg-input-bg border-transparent text-text placeholder-muted rounded-full focus:outline-none focus:bg-bg focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-muted hover:text-text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </form>

            {/* Search Preview Overlay */}
            {showSuggestions && value.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-bg rounded-xl shadow-lg border border-border overflow-hidden z-50">
                    {/* Search for "query" */}
                    <button
                        onClick={() => performSearch(value)}
                        className="w-full text-left px-4 py-3 hover:bg-surface-hover flex items-center gap-3 border-b border-border"
                    >
                        <Search className="w-4 h-4 text-muted" />
                        <span className="text-text">Search for "{value}"</span>
                    </button>

                    {/* User Suggestions */}
                    {suggestions && suggestions.length > 0 && (
                        <div className="py-1">
                            {suggestions.slice(0, 5).map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        navigate({ to: '/profile/$handle', params: { handle: user.username } });
                                        setShowSuggestions(false);
                                        setValue('');
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-surface-hover flex items-center gap-3"
                                >
                                    <img
                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-text truncate">{user.display_name || user.username}</div>
                                        <div className="text-muted text-sm truncate">@{user.username}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
