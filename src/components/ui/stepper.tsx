import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
    steps: string[];
    currentStep: number;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn("relative w-full", className)} aria-label="Registration Progress">
            <ol className="flex items-center justify-between w-full relative z-10">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <li key={step} className="flex flex-col items-center" aria-current={isCurrent ? "step" : undefined}>
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isCompleted || isCurrent ? '#2563eb' : '#e5e7eb',
                                    scale: isCurrent ? 1.1 : 1,
                                }}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300",
                                    (isCompleted || isCurrent) ? "text-white" : "text-gray-500"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </motion.div>
                            <span className={cn(
                                "text-xs mt-2 font-medium transition-colors duration-300 absolute top-8 w-32 text-center",
                                isCurrent ? "text-blue-600" : "text-gray-400"
                            )}>
                                {step}
                            </span>
                        </li>
                    );
                })}
            </ol>

            {/* Progress Bar Background */}
            <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-0" aria-hidden="true" />

            {/* Active Progress Bar */}
            <motion.div
                className="absolute top-4 left-0 h-[2px] bg-blue-600 -z-0"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                aria-hidden="true"
            />
        </div>
    );
}
