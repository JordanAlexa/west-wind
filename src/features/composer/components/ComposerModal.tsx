import { X } from 'lucide-react';
import { Composer, type ComposerHandle } from './Composer';
import { useEffect, useRef } from 'react';

interface ComposerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ComposerModal = ({ isOpen, onClose }: ComposerModalProps) => {
    const composerRef = useRef<ComposerHandle>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        if (composerRef.current) {
            composerRef.current.handleCloseAttempt();
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-background border-2 border-modal-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <button
                        onClick={handleClose}
                        className="p-2 -ml-2 rounded-full hover:bg-surface-hover transition-colors text-muted"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-primary">New Post</span>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>

                <div className="p-4">
                    <Composer ref={composerRef} onSuccess={onClose} onCancel={onClose} />
                </div>
            </div>
        </div>
    );
};
