import React, { useState } from 'react';
import { X, Check, Search } from 'lucide-react';

interface Language {
    code: string;
    name: string;
}

const LANGUAGES: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
];

interface LanguageSelectorProps {
    selected: string[];
    onChange: (codes: string[]) => void;
    onClose: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onChange, onClose }) => {
    const [query, setQuery] = useState('');

    const filteredLanguages = LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(query.toLowerCase())
    );

    const toggleLanguage = (code: string) => {
        if (selected.includes(code)) {
            onChange(selected.filter(c => c !== code));
        } else {
            if (selected.length < 3) {
                onChange([...selected, code]);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md h-[70vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Post Languages</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search languages..."
                            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Select up to 3 languages</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {filteredLanguages.map(lang => {
                        const isSelected = selected.includes(lang.code);
                        const isDisabled = !isSelected && selected.length >= 3;

                        return (
                            <button
                                key={lang.code}
                                onClick={() => toggleLanguage(lang.code)}
                                disabled={isDisabled}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                <span className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {lang.name}
                                </span>
                                {isSelected && <Check className="text-blue-600" size={18} />}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-500 text-white font-bold py-2 rounded-full hover:bg-blue-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
