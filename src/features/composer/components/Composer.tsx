import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useCreatePost } from '../../feed/hooks/useCreatePost';
import { useAuthStore } from '../../auth/stores/authStore';
import { Image, X, Globe, Smile, Film } from 'lucide-react';
import { GifSearch } from './GifSearch';
import { InteractionSettings, type InteractionSetting } from './InteractionSettings';
import { LanguageSelector } from './LanguageSelector';
import { CharacterProgress } from './CharacterProgress';
import { EmojiPicker } from './EmojiPicker';
import { DiscardDialog } from './DiscardDialog';

export interface ComposerHandle {
    handleCloseAttempt: () => void;
}

interface ComposerProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const MAX_CHARS = 333;

export const Composer = forwardRef<ComposerHandle, ComposerProps>(({ onSuccess, onCancel }, ref) => {
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Feature States
    const [showGifSearch, setShowGifSearch] = useState(false);
    const [selectedGif, setSelectedGif] = useState<{ url: string; title: string } | null>(null);

    const [showInteractionSettings, setShowInteractionSettings] = useState(false);
    const [interactionSetting, setInteractionSetting] = useState<InteractionSetting>('everybody');

    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { mutate: createPostMutation, isPending } = useCreatePost();
    const { user } = useAuthStore();

    const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Guest'}`;

    const isDirty = text.trim().length > 0 || images.length > 0 || selectedGif !== null;

    useImperativeHandle(ref, () => ({
        handleCloseAttempt: () => {
            if (isDirty) {
                setShowDiscardDialog(true);
            } else {
                if (onCancel) onCancel();
            }
        }
    }));

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
            { content: text, mediaUrl: selectedGif?.url, images },
            {
                onSuccess: () => {
                    // Reset state
                    setText('');
                    setImages([]);
                    setImagePreviews([]);
                    setSelectedGif(null);
                    if (imageInputRef.current) imageInputRef.current.value = '';

                    if (onSuccess) {
                        onSuccess();
                    }
                },
                onError: () => {
                    alert('Failed to post. Please try again.');
                }
            }
        );
    };

    const handleEmojiSelect = (emoji: any) => {
        const cursorPosition = textareaRef.current?.selectionStart || text.length;
        const newText = text.slice(0, cursorPosition) + emoji.native + text.slice(cursorPosition);
        setText(newText);
        setShowEmojiPicker(false);

        // Restore focus and cursor position (approximate)
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = cursorPosition + emoji.native.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowDiscardDialog(true);
        } else {
            if (onCancel) onCancel();
        }
    };

    const confirmDiscard = () => {
        setShowDiscardDialog(false);
        setText('');
        setImages([]);
        setImagePreviews([]);
        setSelectedGif(null);
        if (onCancel) onCancel();
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 w-full max-w-[600px] relative">
            {/* Close button for modal context */}
            {onCancel && (
                <button
                    onClick={handleCancel}
                    className="absolute top-2 left-2 p-2 hover:bg-gray-100 rounded-full text-blue-500 md:hidden"
                >
                    Cancel
                </button>
            )}

            <div className="flex gap-3 mt-10 md:mt-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0">
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <div className="flex-grow">
                    <textarea
                        ref={textareaRef}
                        className="w-full resize-none border-none focus:ring-0 text-gray-900 placeholder-gray-500 text-lg min-h-[100px] p-2"
                        placeholder="What's up?"
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
                                        <div key={index} className="relative w-32 h-32">
                                            {isVideo ? (
                                                <video src={src} className="w-full h-full object-cover rounded-lg" controls />
                                            ) : (
                                                <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-lg" />
                                            )}
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {selectedGif && (
                            <div className="relative w-full max-w-[300px] rounded-lg overflow-hidden border border-gray-200">
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
                </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 relative">
                <div className="flex items-center gap-1 text-blue-500">
                    <input
                        type="file"
                        ref={imageInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleImageSelect}
                        data-testid="image-input"
                    />

                    <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-blue-50 rounded-full transition-colors" title="Image">
                        <Image size={20} />
                    </button>
                    <button onClick={() => setShowGifSearch(true)} className="p-2 hover:bg-blue-50 rounded-full transition-colors" title="GIF">
                        <Film size={20} />
                    </button>

                    <div className="relative">
                        <button
                            ref={emojiButtonRef}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-2 hover:bg-blue-50 rounded-full transition-colors ${showEmojiPicker ? 'bg-blue-50 text-blue-600' : ''}`}
                            title="Emoji"
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

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <button
                        onClick={() => setShowInteractionSettings(true)}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded-full text-sm font-medium transition-colors"
                    >
                        <Globe size={16} />
                        <span className="hidden sm:inline">
                            {interactionSetting === 'everybody' ? 'Everybody can reply' :
                                interactionSetting === 'nobody' ? 'Nobody can reply' :
                                    interactionSetting === 'mentioned' ? 'Mentioned can reply' : 'Followed can reply'}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowLanguageSelector(true)}
                        className="text-gray-500 hover:text-blue-500 text-sm font-medium"
                    >
                        {selectedLanguages.length > 0 ? selectedLanguages.join(', ').toUpperCase() : 'Lang'}
                    </button>

                    <CharacterProgress count={text.length} max={MAX_CHARS} />

                    <button
                        onClick={handlePost}
                        disabled={!isDirty || isPending || text.length > MAX_CHARS}
                        className="bg-blue-500 text-white font-bold py-1.5 px-5 rounded-full text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Posting...' : 'Post'}
                    </button>
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

            {showInteractionSettings && (
                <InteractionSettings
                    value={interactionSetting}
                    onChange={setInteractionSetting}
                    onClose={() => setShowInteractionSettings(false)}
                />
            )}

            {showLanguageSelector && (
                <LanguageSelector
                    selected={selectedLanguages}
                    onChange={setSelectedLanguages}
                    onClose={() => setShowLanguageSelector(false)}
                />
            )}

            {showDiscardDialog && (
                <DiscardDialog
                    onDiscard={confirmDiscard}
                    onCancel={() => setShowDiscardDialog(false)}
                />
            )}
        </div>
    );
});

Composer.displayName = 'Composer';
