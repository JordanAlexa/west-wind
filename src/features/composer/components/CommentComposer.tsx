
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../auth/stores/authStore';
import { useCreatePost } from '../../feed/hooks/useCreatePost';
import { Image, Film, Smile, X } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { GifSearch } from './GifSearch';
import { LanguageSelector } from './LanguageSelector';
import { CharacterProgress } from './CharacterProgress';

interface CommentComposerProps {
    parentId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const MAX_CHARS = 300;

export const CommentComposer = ({ parentId, onSuccess }: CommentComposerProps) => {
    const { user } = useAuthStore();
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Feature States
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifSearch, setShowGifSearch] = useState(false);
    const [selectedGif, setSelectedGif] = useState<{ url: string; title: string } | null>(null);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const { mutate: createPostMutation, isPending } = useCreatePost();

    const isDirty = text.trim().length > 0 || images.length > 0 || selectedGif !== null;

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files);
            setImages(prev => [...prev, ...newImages]);

            const newPreviews = newImages.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handlePost = () => {
        if (!isDirty) return;

        createPostMutation(
            { content: text, parentId, mediaUrl: selectedGif?.url, images },
            {
                onSuccess: () => {
                    setText('');
                    setImages([]);
                    setImagePreviews([]);
                    setSelectedGif(null);
                    if (onSuccess) onSuccess();
                },
                onError: () => {
                    alert('Failed to reply. Please try again.');
                }
            }
        );
    };

    const handleEmojiSelect = (emoji: any) => {
        const cursorPosition = textareaRef.current?.selectionStart || text.length;
        const newText = text.slice(0, cursorPosition) + emoji.native + text.slice(cursorPosition);
        setText(newText);
        setShowEmojiPicker(false);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = cursorPosition + emoji.native.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    return (
        <div className="flex gap-3 p-4 border-b border-gray-100 relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-300" />
                )}
            </div>
            <div className="flex-grow">
                <textarea
                    ref={textareaRef}
                    className="w-full resize-none border-none focus:ring-0 text-gray-900 placeholder-gray-500 text-lg min-h-[50px] p-0 bg-transparent"
                    placeholder="Write your reply"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {/* Media Previews */}
                <div className="mt-2 space-y-2">
                    {imagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {imagePreviews.map((src, index) => {
                                const isVideo = images[index]?.type.startsWith('video/');
                                return (
                                    <div key={index} className="relative w-24 h-24">
                                        {isVideo ? (
                                            <video src={src} className="w-full h-full object-cover rounded-lg" controls />
                                        ) : (
                                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-lg" />
                                        )}
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {selectedGif && (
                        <div className="relative w-full max-w-[200px] rounded-lg overflow-hidden border border-gray-200">
                            <img src={selectedGif.url} alt={selectedGif.title} className="w-full h-auto" />
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">GIF</div>
                            <button
                                onClick={() => setSelectedGif(null)}
                                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 text-blue-500">
                        <input
                            type="file"
                            ref={imageInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleImageSelect}
                        />

                        <button
                            onClick={() => imageInputRef.current?.click()}
                            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                            title="Image"
                        >
                            <Image size={20} />
                        </button>

                        <button
                            onClick={() => setShowGifSearch(true)}
                            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                            title="GIF"
                        >
                            <Film size={20} />
                        </button>

                        <div className="relative">
                            <button
                                ref={emojiButtonRef}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-2 hover:bg-blue-50 rounded-full transition-colors ${showEmojiPicker ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                                <Smile size={20} />
                            </button>
                            {showEmojiPicker && (
                                <EmojiPicker
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setShowEmojiPicker(false)}
                                    triggerRef={emojiButtonRef}
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setShowLanguageSelector(true)}
                            className="text-gray-500 hover:text-blue-500 text-sm font-medium px-2"
                        >
                            {selectedLanguages.length > 0 ? selectedLanguages[0].toUpperCase() : 'EN'}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <CharacterProgress count={text.length} max={MAX_CHARS} />
                        <button
                            onClick={handlePost}
                            disabled={!isDirty || isPending || text.length > MAX_CHARS}
                            className="bg-blue-500 text-white font-bold py-1.5 px-4 rounded-full text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Reply' : 'Reply'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showGifSearch && (
                <GifSearch
                    onSelect={(gif) => {
                        setSelectedGif({ url: gif.url, title: gif.title });
                        setShowGifSearch(false);
                    }}
                    onClose={() => setShowGifSearch(false)}
                />
            )}

            {showLanguageSelector && (
                <LanguageSelector
                    selected={selectedLanguages}
                    onChange={setSelectedLanguages}
                    onClose={() => setShowLanguageSelector(false)}
                />
            )}
        </div>
    );
};
