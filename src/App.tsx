import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { useAuthStore } from './features/auth/stores/authStore'
import { AuthHandler } from './features/auth/components/AuthHandler'

import './App.css'

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'

import { loginWithIdToken } from './features/auth/api/login'

function App() {
  const { setUser, setLoading, loading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "Logged in" : "Logged out", user?.email)

      if (user) {
        try {
          // 1. Get ID Token
          const idToken = await user.getIdToken();
          // 2. Exchange for Session Cookie
          await loginWithIdToken(idToken);
          console.log("Session cookie established");

          // 3. Sync User (Create/Update)
          try {
            await useAuthStore.getState().syncUser(user);
            console.log("User synced with backend");

            // 4. Redirect to home if on login/register pages
            const path = window.location.pathname;
            if (path === '/register' || path === '/login') {
              window.location.href = '/';
            }

          } catch (fetchError) {
            console.error("Failed to sync user:", fetchError);
            // If sync fails, we might still want to set the user as GUEST or handle error
            setUser({ ...user, role: 'USER' } as any);
          }
        } catch (error) {
          console.error("Failed to init auth:", error);
          setUser(null);
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })
    return () => unsubscribe()
  }, [setUser, setLoading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <AuthHandler />
      <Outlet />
      <Toaster />
    </>
  )
}

export default App
