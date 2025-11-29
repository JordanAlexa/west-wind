import React from 'react';
import { Globe, Users, UserCheck, Lock, X, Check } from 'lucide-react';

export type InteractionSetting = 'everybody' | 'nobody' | 'mentioned' | 'followed';

interface InteractionSettingsProps {
    value: InteractionSetting;
    onChange: (value: InteractionSetting) => void;
    onClose: () => void;
}

const OPTIONS: { id: InteractionSetting; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: 'everybody',
        label: 'Everybody',
        icon: <Globe size={20} />,
        description: 'Everyone can reply to this post'
    },
    {
        id: 'mentioned',
        label: 'Mentioned users',
        icon: <Users size={20} />,
        description: 'Only users mentioned in this post can reply'
    },
    {
        id: 'followed',
        label: 'Followed users',
        icon: <UserCheck size={20} />,
        description: 'Users you follow can reply'
    },
    {
        id: 'nobody',
        label: 'Nobody',
        icon: <Lock size={20} />,
        description: 'No one can reply'
    },
];

export const InteractionSettings: React.FC<InteractionSettingsProps> = ({ value, onChange, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Who can reply?</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-2">
                    {OPTIONS.map(option => (
                        <button
                            key={option.id}
                            onClick={() => {
                                onChange(option.id);
                                onClose();
                            }}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                        >
                            <div className="text-gray-500 group-hover:text-blue-500 transition-colors">
                                {option.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-500">{option.description}</div>
                            </div>
                            {value === option.id && (
                                <Check className="text-blue-500" size={20} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
