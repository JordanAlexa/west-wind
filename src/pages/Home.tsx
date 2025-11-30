import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/stores/authStore'
import { Layout } from '../components/Layout'
import logoTransparent from '../assets/logo_transparent_v1_small.png'
import { Feed } from '../features/feed/components/Feed'
import { ComposerModal } from '../features/composer/components/ComposerModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginSchema } from '../features/auth/schemas/authSchemas'
import { toast } from 'sonner'

function Home() {
    const navigate = useNavigate()
    const { user, loading, signInWithGoogle } = useAuthStore()
    const [isComposerOpen, setIsComposerOpen] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginSchema) => {
        // TODO: Implement actual login logic with backend
        console.log('Login data:', data)
        toast.info('Login logic not yet implemented on backend for password auth', {
            description: 'Please use Google Login for now',
        })
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
                    <div className="bg-white px-10 pt-10 pb-6 flex flex-col items-center w-[350px]">
                        <h1 className="text-5xl mb-8 tracking-tighter" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>West-Wind</h1>

                        <form className="w-full flex flex-col gap-1.5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="Phone number, username, or email"
                                    className={`w-full bg-[#fafafa] border ${errors.identifier ? 'border-red-500' : 'border-[#dbdbdb]'} rounded-[3px] px-[9px] py-[9px] text-xs focus:outline-none focus:border-gray-400 placeholder-gray-500`}
                                    {...register('identifier')}
                                />
                                {errors.identifier && <span className="text-red-500 text-[10px] mt-1">{errors.identifier.message}</span>}
                            </div>

                            <div className="w-full">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className={`w-full bg-[#fafafa] border ${errors.password ? 'border-red-500' : 'border-[#dbdbdb]'} rounded-[3px] px-[9px] py-[9px] text-xs focus:outline-none focus:border-gray-400 placeholder-gray-500`}
                                    {...register('password')}
                                />
                                {errors.password && <span className="text-red-500 text-[10px] mt-1">{errors.password.message}</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#0095f6] text-white font-semibold py-[5px] rounded-[8px] mt-2 text-sm hover:bg-[#1877f2] transition-colors disabled:opacity-70 flex justify-center items-center"
                            >
                                {isSubmitting ? 'Logging in...' : 'Log in'}
                            </button>
                        </form>

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

                        <a href="#" className="text-xs text-[#00376b] mt-2">Forgot password?</a>
                    </div>

                    {/* Sign Up Box */}
                    <div className="bg-white p-5 flex items-center justify-center w-[350px]">
                        <p className="text-sm">
                            Don't have an account? <span onClick={() => navigate({ to: '/register' })} className="text-[#0095f6] font-semibold cursor-pointer ml-1">Sign up</span>
                        </p>
                    </div>
                </div>
            </main>

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
