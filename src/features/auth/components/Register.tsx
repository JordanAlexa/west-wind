import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../stores/authStore'
import { RegisterSchema } from '../../../lib/schemas'
import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Stepper } from '@/components/ui/stepper'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { AvatarUpload } from './AvatarUpload'

type RegisterFormValues = z.infer<typeof RegisterSchema>

const steps = ['Credentials', 'Personal Info', 'Review']

function Register() {
    const navigate = useNavigate()
    const { signInWithGoogle, registerWithEmail } = useAuthStore()
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: '',
            username: '',
            display_name: '',
            dob: '',
            terms: false,
        },
        mode: 'onChange'
    })

    const { trigger, watch } = form
    // const password = watch('password') // Password removed

    const nextStep = async () => {
        let fieldsToValidate: (keyof RegisterFormValues)[] = []

        if (currentStep === 0) {
            fieldsToValidate = ['email']
        } else if (currentStep === 1) {
            fieldsToValidate = ['username', 'display_name', 'dob']
        }

        const isStepValid = await trigger(fieldsToValidate)

        if (isStepValid) {
            setDirection(1)
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
        }
    }

    const prevStep = () => {
        setDirection(-1)
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    const onSubmit = async (values: RegisterFormValues) => {
        setIsSubmitting(true)
        try {

            await registerWithEmail({
                ...values,
                avatar_file: avatarFile
            })
            setRegistrationSuccess(true)
        } catch (error) {
            console.error("Registration failed:", error)
            // TODO: Show error toast
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (currentStep < steps.length - 1) {
                nextStep()
            } else {
                form.handleSubmit(onSubmit)()
            }
        }
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    }

    const shakeVariant = {
        shake: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
        },
        idle: { x: 0 }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-gray-900">

            {/* Left Panel - Desktop Only */}
            <div className="hidden md:flex md:w-1/3 bg-gray-50 items-center justify-end p-12">
                <div className="max-w-md text-right">
                    <h1 className="text-4xl font-bold text-blue-600 mb-4">Create an Account</h1>
                    <p className="text-xl text-gray-600">We're so excited to have you join us!</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className={`w-full md:w-2/3 flex items-center p-6 md:p-12 ${registrationSuccess ? 'justify-center' : 'justify-start'}`}>
                <div className="w-full max-w-md bg-white h-full md:h-auto flex flex-col">

                    {registrationSuccess ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Registration Successful!</h1>
                            <p className="text-gray-600">
                                We've sent a verification email to <span className="font-medium text-gray-900">{form.getValues('email')}</span>.
                                Please check your inbox to verify your account.
                            </p>
                            <Button
                                onClick={() => navigate({ to: '/' })}
                                className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Go to Home
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Stepper */}
                            <div className="mb-8">
                                <Stepper steps={steps} currentStep={currentStep} />
                            </div>

                            {/* Header */}
                            <h1 className="text-3xl font-bold text-black mb-2">
                                {steps[currentStep]}
                            </h1>
                            <div className="text-gray-600 mb-6 text-sm">
                                Step {currentStep + 1} of {steps.length}
                            </div>

                            {/* Form */}
                            <FormProvider {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-grow flex flex-col relative overflow-hidden"
                                >
                                    <AnimatePresence initial={false} custom={direction} mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.2 }
                                            }}
                                            className="space-y-4 flex-grow"
                                        >
                                            {currentStep === 0 && (
                                                <>
                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>Email</FormLabel>
                                                                <motion.div variants={shakeVariant} animate={fieldState.error ? "shake" : "idle"}>
                                                                    <div className="relative">
                                                                        <FormControl>
                                                                            <Input placeholder="Enter your email address" {...field} className={fieldState.error ? "border-red-500" : fieldState.isDirty && !fieldState.invalid ? "border-green-500" : ""} />
                                                                        </FormControl>
                                                                        {fieldState.isDirty && !fieldState.invalid && (
                                                                            <Check className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="h-4"></div>

                                                    <div className="relative my-6">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <div className="w-full border-t border-gray-200"></div>
                                                        </div>
                                                        <div className="relative flex justify-center text-sm">
                                                            <span className="px-2 bg-white text-gray-500">or continue with</span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => signInWithGoogle().then(() => navigate({ to: '/' }))}
                                                        className="w-full gap-2"
                                                    >
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                        </svg>
                                                        Google
                                                    </Button>
                                                </>
                                            )}

                                            {currentStep === 1 && (
                                                <>
                                                    <FormField
                                                        control={form.control}
                                                        name="username"
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>Username</FormLabel>
                                                                <motion.div variants={shakeVariant} animate={fieldState.error ? "shake" : "idle"}>
                                                                    <div className="relative">
                                                                        <FormControl>
                                                                            <Input placeholder="@username" {...field} className={fieldState.error ? "border-red-500" : fieldState.isDirty && !fieldState.invalid ? "border-green-500" : ""} />
                                                                        </FormControl>
                                                                        {fieldState.isDirty && !fieldState.invalid && (
                                                                            <Check className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="display_name"
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>Display Name</FormLabel>
                                                                <motion.div variants={shakeVariant} animate={fieldState.error ? "shake" : "idle"}>
                                                                    <div className="relative">
                                                                        <FormControl>
                                                                            <Input placeholder="Your Name" {...field} className={fieldState.error ? "border-red-500" : fieldState.isDirty && !fieldState.invalid ? "border-green-500" : ""} />
                                                                        </FormControl>
                                                                        {fieldState.isDirty && !fieldState.invalid && (
                                                                            <Check className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex justify-center my-4">
                                                        <AvatarUpload onFileSelect={setAvatarFile} />
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="dob"
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>Date of Birth</FormLabel>
                                                                <motion.div variants={shakeVariant} animate={fieldState.error ? "shake" : "idle"}>
                                                                    <FormControl>
                                                                        <Input type="date" {...field} className={fieldState.error ? "border-red-500" : ""} />
                                                                    </FormControl>
                                                                </motion.div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </>
                                            )}

                                            {currentStep === 2 && (
                                                <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                                                    <h3 className="font-semibold text-lg">Review your details</h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500 block">Email</span>
                                                            <span className="font-medium">{form.getValues('email')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block">Username</span>
                                                            <span className="font-medium">@{form.getValues('username')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block">Display Name</span>
                                                            <span className="font-medium">{form.getValues('display_name')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block">Date of Birth</span>
                                                            <span className="font-medium">{form.getValues('dob')}</span>
                                                        </div>
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="terms"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white mt-4">
                                                                <FormControl>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={field.value}
                                                                        onChange={field.onChange}
                                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel>
                                                                        I accept the Terms and Conditions
                                                                    </FormLabel>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        By clicking this, you agree to our Terms of Service and Privacy Policy.
                                                                    </p>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                                        {currentStep > 0 ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={prevStep}
                                                className="rounded-full px-6 gap-2"
                                            >
                                                <ChevronLeft className="w-4 h-4" /> Back
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => navigate({ to: '/' })}
                                                className="rounded-full px-6"
                                            >
                                                Cancel
                                            </Button>
                                        )}

                                        {currentStep < steps.length - 1 ? (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                            >
                                                Next <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !watch('terms')}
                                                className="rounded-full px-6 bg-green-600 hover:bg-green-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Creating...' : 'Create Account'} <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </FormProvider>
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Register
