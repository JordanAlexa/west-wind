import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../stores/authStore'
import { useFormik } from 'formik'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { RegisterSchema } from '../../../lib/schemas'
import { z } from 'zod'

function Register() {
    const navigate = useNavigate()
    const { signInWithGoogle } = useAuthStore()

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            dob: '',
        },
        validationSchema: toFormikValidationSchema(RegisterSchema),
        onSubmit: (values: z.infer<typeof RegisterSchema>) => {
            console.log("Form valid, proceeding...", values)
            // Proceed to next step (mock)
        },
    })

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
            <div className="w-full md:w-2/3 flex items-center justify-start p-6 md:p-12">
                <div className="w-full max-w-md bg-white h-full md:h-auto flex flex-col">

                    {/* Step Indicator */}
                    <div className="text-sm font-medium text-gray-500 mb-2">
                        Step 1 of 3
                    </div>

                    {/* Header */}
                    <h1 className="text-3xl font-bold text-black mb-6">
                        Your account
                    </h1>

                    {/* Sub-header / Context */}
                    <div className="text-gray-600 mb-6 text-sm">
                        You are creating an account on <span className="font-semibold text-gray-800">West-Wind</span>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={() => signInWithGoogle().then(() => navigate({ to: '/' }))}
                        className="w-full mb-6 flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or continue with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="flex flex-col gap-4 flex-grow" onSubmit={formik.handleSubmit}>

                        {/* Email Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    className={`w-full bg-gray-100 border-none rounded-lg py-3 px-4 pl-10 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${formik.touched.email && formik.errors.email ? 'ring-2 ring-red-500' : ''}`}
                                    {...formik.getFieldProps('email')}
                                />
                                <span className="absolute left-3 top-3.5 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </span>
                            </div>
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Choose your password"
                                    className={`w-full bg-gray-100 border-none rounded-lg py-3 px-4 pl-10 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${formik.touched.password && formik.errors.password ? 'ring-2 ring-red-500' : ''}`}
                                    {...formik.getFieldProps('password')}
                                />
                                <span className="absolute left-3 top-3.5 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </span>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                            )}
                        </div>

                        {/* Date of Birth Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700" htmlFor="dob">
                                Your birth date
                            </label>
                            <div className="relative">
                                <input
                                    id="dob"
                                    type="date"
                                    className={`w-full bg-gray-100 border-none rounded-lg py-3 px-4 pl-10 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none ${formik.touched.dob && formik.errors.dob ? 'ring-2 ring-red-500' : ''}`}
                                    {...formik.getFieldProps('dob')}
                                />
                                <span className="absolute left-3 top-3.5 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                    </svg>
                                </span>
                            </div>
                            {formik.touched.dob && formik.errors.dob && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.dob}</div>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="text-xs text-gray-500 mt-4 leading-relaxed">
                            By creating an account you agree to the <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 md:border-none">
                            <button
                                type="button"
                                onClick={() => navigate({ to: '/' })}
                                className="px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Next
                            </button>
                        </div>

                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                            English
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                        <div className="flex-grow"></div>
                        <div>
                            Having trouble? <a href="#" className="text-blue-500 hover:underline">Contact support</a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Register
