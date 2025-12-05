import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/stores/authStore'
import { useSocket } from '@/context/SocketContext'
import { Mail } from 'lucide-react'

const Header = () => {
    const navigate = useNavigate()
    const { user, signOut } = useAuthStore()
    const { unreadCount } = useSocket()

    const handleSignOut = async () => {
        await signOut()
        navigate({ to: '/' })
    }

    if (!user) return null

    return (
        <header className="w-full bg-white border-b border-gray-100 py-3 px-6 flex items-center justify-between sticky top-0 z-50">
            {/* Logo / Brand */}
            <div className="font-bold text-xl text-gray-900 tracking-tight">
                West Wind
            </div>

            {/* User Status */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative cursor-pointer hover:text-blue-600 transition-colors">
                    <Mail size={20} className="text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    <span className="text-sm font-medium text-gray-700">
                        {user.email}
                    </span>
                </div>

                <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                    Sign out
                </button>
            </div>
        </header>
    )
}

export default Header
