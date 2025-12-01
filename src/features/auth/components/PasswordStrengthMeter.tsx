import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
    password?: string;
}

export function PasswordStrengthMeter({ password = '' }: PasswordStrengthMeterProps) {
    const requirements = [
        { label: 'At least 8 characters', valid: password.length >= 8 },
        { label: 'Contains a number', valid: /\d/.test(password) },
        { label: 'Contains a special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
        { label: 'Contains uppercase & lowercase', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    ];

    const strength = requirements.filter(r => r.valid).length;
    const strengthColor =
        strength === 0 ? 'bg-gray-200' :
            strength <= 2 ? 'bg-red-500' :
                strength === 3 ? 'bg-yellow-500' :
                    'bg-green-500';

    return (
        <div className="space-y-3 mt-2">
            {/* Strength Bars */}
            <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((level) => (
                    <motion.div
                        key={level}
                        className={cn(
                            "h-full flex-1 rounded-full transition-colors duration-300",
                            strength >= level ? strengthColor : "bg-gray-200"
                        )}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: level * 0.1 }}
                    />
                ))}
            </div>

            {/* Requirements List */}
            <div className="space-y-1">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        {req.valid ? (
                            <Check className="w-3 h-3 text-green-500" />
                        ) : (
                            <X className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={cn(
                            "transition-colors duration-300",
                            req.valid ? "text-green-600 font-medium" : "text-gray-500"
                        )}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
