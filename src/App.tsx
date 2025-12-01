import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { useAuthStore, syncUserWithBackend } from './features/auth/stores/authStore'
import { AuthHandler } from './features/auth/components/AuthHandler'

import './App.css'

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'

import { loginWithIdToken } from './features/auth/api/login'
import { getCurrentUser } from './features/profile/api/users'

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

          // 3. Get User Role (Read Only)
          try {
            const data = await getCurrentUser({ skipErrorToast: true });
            console.log("User synced with backend (read-only)");
            // Merge backend user data (role, username, avatar_url, etc.) with firebase user
            // We prioritize backend data for profile fields
            setUser({
              ...user,
              ...data,
              // Ensure we keep Firebase-specific fields if needed, but backend data should be source of truth for profile
              uid: user.uid,
              email: user.email
            } as any);

            // 4. Redirect to home if on login/register pages
            const path = window.location.pathname;
            if (path === '/register' || path === '/login') {
              window.location.href = '/';
            }

          } catch (fetchError) {
            console.warn("User not found in backend yet (might be registering):", fetchError);
            // If 404, it means user is authenticated in Firebase but not in our DB.
            // This is expected during the very first milliseconds of registration, 
            // or if the user was deleted from DB but not Firebase.
            // We treat them as a GUEST or basic USER until they are properly synced.
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
