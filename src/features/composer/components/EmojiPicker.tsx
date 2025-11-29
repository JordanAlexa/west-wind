import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
    onSelect: (emoji: any) => void;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement | null>;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose, triggerRef }) => {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useEffect(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const pickerHeight = 435; // Approx height of emoji picker
            const pickerWidth = 350; // Approx width

            let top = rect.top - pickerHeight - 10;
            let left = rect.left;

            // Check if it fits above, if not put it below
            if (top < 10) {
                top = rect.bottom + 10;
            }

            // Check if it fits on the right
            if (left + pickerWidth > window.innerWidth) {
                left = window.innerWidth - pickerWidth - 10;
            }

            // Check if it fits on the left
            if (left < 10) {
                left = 10;
            }

            setPosition({ top, left });
        }
    }, [triggerRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, triggerRef]);

    return createPortal(
        <div
            ref={pickerRef}
            className="fixed z-[70] shadow-xl rounded-xl overflow-hidden"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <Picker
                data={data}
                onEmojiSelect={onSelect}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
            />
        </div>,
        document.body
    );
};
