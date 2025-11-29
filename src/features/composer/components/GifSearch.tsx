import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface Gif {
    id: string;
    url: string;
    preview: string;
    title: string;
}

// Mock Data
const MOCK_GIFS: Gif[] = [
    { id: '1', title: 'Cat coding', url: 'https://media.tenor.com/7x6qS-k5b8cAAAAM/cat-typing.gif', preview: 'https://media.tenor.com/7x6qS-k5b8cAAAAM/cat-typing.gif' },
    { id: '2', title: 'Success kid', url: 'https://media.tenor.com/5aF8lE4s6iMAAAAM/success-kid-hell-yeah.gif', preview: 'https://media.tenor.com/5aF8lE4s6iMAAAAM/success-kid-hell-yeah.gif' },
    { id: '3', title: 'Mind blown', url: 'https://media.tenor.com/1X2v6p6q8AAAAAAM/mind-blown-explosion.gif', preview: 'https://media.tenor.com/1X2v6p6q8AAAAAAM/mind-blown-explosion.gif' },
    { id: '4', title: 'This is fine', url: 'https://media.tenor.com/9q3l3n4m5oAAAAAM/this-is-fine-dog.gif', preview: 'https://media.tenor.com/9q3l3n4m5oAAAAAM/this-is-fine-dog.gif' },
    { id: '5', title: 'Party parrot', url: 'https://media.tenor.com/2k3j4l5m6nAAAAAM/party-parrot.gif', preview: 'https://media.tenor.com/2k3j4l5m6nAAAAAM/party-parrot.gif' },
    { id: '6', title: 'Facepalm', url: 'https://media.tenor.com/3o4p5q6r7sAAAAAM/facepalm-picard.gif', preview: 'https://media.tenor.com/3o4p5q6r7sAAAAAM/facepalm-picard.gif' },
];

interface GifSearchProps {
    onSelect: (gif: Gif) => void;
    onClose: () => void;
}

export const GifSearch: React.FC<GifSearchProps> = ({ onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Gif[]>(MOCK_GIFS);
    const [isLoading, setIsLoading] = useState(false);

    const searchTenor = async (searchQuery: string) => {
        const apiKey = import.meta.env.VITE_TENOR_API_KEY;
        if (!apiKey) {
            console.warn('VITE_TENOR_API_KEY not found, using mock data');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&limit=20`);
            const data = await response.json();

            if (data.results) {
                const tenorGifs: Gif[] = data.results.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    url: item.media_formats.gif.url,
                    preview: item.media_formats.tinygif.url
                }));
                setResults(tenorGifs);
            }
        } catch (error) {
            console.error('Error fetching from Tenor:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);

        if (q.trim() === '') {
            setResults(MOCK_GIFS);
            return;
        }

        // Debounce or just search if key exists, else filter mock
        if (!import.meta.env.VITE_TENOR_API_KEY) {
            setResults(MOCK_GIFS.filter(g => g.title.toLowerCase().includes(q.toLowerCase())));
        }
    };

    // Effect to handle debounce for API calls
    useEffect(() => {
        if (!query.trim() || !import.meta.env.VITE_TENOR_API_KEY) return;

        const timeoutId = setTimeout(() => {
            searchTenor(query);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search GIFs..."
                            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={query}
                            onChange={handleSearch}
                            autoFocus
                        />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Loading...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {results.map(gif => (
                                <button
                                    key={gif.id}
                                    className="relative aspect-video rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                                    onClick={() => onSelect(gif)}
                                >
                                    <img src={gif.preview} alt={gif.title} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                    {!isLoading && results.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            No GIFs found for "{query}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
