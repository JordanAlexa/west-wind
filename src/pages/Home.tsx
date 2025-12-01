import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/stores/authStore'
import { Layout } from '../components/Layout'
import logoTransparent from '../assets/logo_transparent_v1_small.png'
import { Feed } from '../features/feed/components/Feed'
import { ComposerModal } from '../features/composer/components/ComposerModal'
import { toast } from 'sonner'
import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from '../lib/firebase'

function Home() {
    const navigate = useNavigate()
    const { user, loading, signInWithGoogle, sendEmailLink, signInWithPhoneNumber } = useAuthStore()
    const [isComposerOpen, setIsComposerOpen] = useState(false)

    // Auth States
    const [authMode, setAuthMode] = useState<'email' | 'phone' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [confirmationResult, setConfirmationResult] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Recaptcha
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return toast.error('Please enter your email')

        setIsSubmitting(true)
        try {
            await sendEmailLink(email)
            toast.success('Login link sent!', {
                description: 'Check your email to complete sign in.'
            })
            window.localStorage.setItem('emailForSignIn', email)
        } catch (error: any) {
            toast.error(error.message || 'Failed to send link')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phoneNumber) return toast.error('Please enter your phone number')

        setIsSubmitting(true)
        try {
            // Lazy initialization of RecaptchaVerifier
            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                        // reCAPTCHA solved, allow signInWithPhoneNumber.
                    }
                });
            }

            const confirmation = await signInWithPhoneNumber(phoneNumber, recaptchaVerifierRef.current)
            setConfirmationResult(confirmation)
            setAuthMode('code')
            toast.success('Code sent!')
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to send code')
            // Reset recaptcha on error
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear()
                recaptchaVerifierRef.current = null
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!verificationCode) return toast.error('Please enter the code')

        setIsSubmitting(true)
        try {
            await confirmationResult.confirm(verificationCode)
            toast.success('Phone verified!')
        } catch (error: any) {
            toast.error(error.message || 'Invalid code')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (user) {
        return (
            <>
                <Layout onNewPost={() => setIsComposerOpen(true)}>
                    <div className="w-full">
                        <div className="bg-bg border-b border-border px-4 py-3 flex justify-center items-center">
                            <img src={logoTransparent} alt="West Wind" className="h-24 w-auto object-contain" />
                        </div>
                        <div className="sticky top-0 z-10 bg-bg h-[48px] w-full"></div>
                        <Feed />
                    </div>
                </Layout>
                <ComposerModal
                    isOpen={isComposerOpen}
                    onClose={() => setIsComposerOpen(false)}
                />
            </>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text font-sans">
            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center p-4 gap-8">
                {/* Left Side - Placeholder */}
                <div className="hidden md:flex items-center justify-center" style={{ width: '570px', height: '492px' }}>
                    <img src={logoTransparent} alt="West Wind" className="w-full h-full object-contain" />
                </div>

                {/* Right Side - Login Form */}
                <div className="flex flex-col gap-3">
                    {/* Login Box */}
                    <div className="bg-white px-10 pt-10 pb-6 flex flex-col items-center w-[350px] border border-gray-200 rounded-sm">
                        <h1 className="text-5xl mb-8 tracking-tighter text-black" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>West-Wind</h1>

                        {authMode === 'email' && (
                            <form className="w-full flex flex-col gap-3" onSubmit={handleEmailLogin}>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] px-[9px] py-[9px] text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500 text-black"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#0095f6] text-white font-semibold py-[5px] rounded-[8px] text-sm hover:bg-[#1877f2] transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Login Link'}
                                </button>
                            </form>
                        )}

                        {authMode === 'phone' && (
                            <form className="w-full flex flex-col gap-3" onSubmit={handlePhoneLogin}>
                                <input
                                    type="tel"
                                    placeholder="Phone Number (e.g. +1...)"
                                    className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] px-[9px] py-[9px] text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500 text-black"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#0095f6] text-white font-semibold py-[5px] rounded-[8px] text-sm hover:bg-[#1877f2] transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('email')}
                                    className="text-xs text-[#00376b] mt-2 hover:underline"
                                >
                                    Back to Email
                                </button>
                            </form>
                        )}

                        {authMode === 'code' && (
                            <form className="w-full flex flex-col gap-3" onSubmit={handleVerifyCode}>
                                <input
                                    type="text"
                                    placeholder="Verification Code"
                                    className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-[3px] px-[9px] py-[9px] text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500 text-black"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#0095f6] text-white font-semibold py-[5px] rounded-[8px] text-sm hover:bg-[#1877f2] transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('phone')}
                                    className="text-xs text-[#00376b] mt-2 hover:underline"
                                >
                                    Back to Phone
                                </button>
                            </form>
                        )}

                        <div className="w-full flex items-center gap-4 my-4">
                            <div className="h-px bg-[#dbdbdb] flex-grow"></div>
                            <span className="text-[13px] font-semibold text-[#737373]">OR</span>
                            <div className="h-px bg-[#dbdbdb] flex-grow"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => signInWithGoogle()}
                            className="flex items-center gap-2 text-sm font-semibold text-[#385185] mb-3 hover:text-[#1877f2] transition-colors"
                        >
                            <span className="text-lg font-bold">G</span> Log in with Google
                        </button>

                        {authMode === 'email' && (
                            <button
                                type="button"
                                onClick={() => setAuthMode('phone')}
                                className="text-sm font-semibold text-[#385185] hover:text-[#1877f2] transition-colors"
                            >
                                Log in with Phone
                            </button>
                        )}
                    </div>

                    {/* Sign Up Box */}
                    <div className="bg-white p-5 flex items-center justify-center w-[350px] border border-gray-200 rounded-sm">
                        <p className="text-sm text-black">
                            Don't have an account? <span onClick={() => navigate({ to: '/register' })} className="text-[#0095f6] font-semibold cursor-pointer ml-1">Sign up</span>
                        </p>
                    </div>
                </div>
            </main>
            <div id="recaptcha-container"></div>

            {/* Footer */}
            <footer className="py-8 text-center text-xs text-gray-500">
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                    <a href="#" className="hover:underline">About</a>
                    <a href="#" className="hover:underline">Blog</a>
                    <a href="#" className="hover:underline">Jobs</a>
                </div>
                <div>
                    &copy; 2025 West-Wind from Jordan
                </div>
            </footer>
        </div>
    )
}

export default Home
