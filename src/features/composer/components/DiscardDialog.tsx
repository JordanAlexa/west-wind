import React from 'react';

interface DiscardDialogProps {
    onDiscard: () => void;
    onCancel: () => void;
}

export const DiscardDialog: React.FC<DiscardDialogProps> = ({ onDiscard, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
                <h2 className="text-xl font-bold mb-2">Discard post?</h2>
                <p className="text-gray-600 mb-6">
                    You can't undo this and you'll lose your draft.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onDiscard}
                        className="w-full bg-red-500 text-white font-bold py-3 rounded-full hover:bg-red-600 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full bg-transparent text-gray-900 font-bold py-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
