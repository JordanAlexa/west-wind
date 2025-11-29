import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { useAuthStore } from './features/auth/stores/authStore'

import './App.css'

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'

import { syncUser } from './features/profile/api/users'

function App() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "Logged in" : "Logged out", user?.email)

      if (user) {
        try {
          const data = await syncUser(user);
          console.log("User synced with backend");
          // Merge role from backend with firebase user
          setUser({ ...user, role: data.role } as any);
        } catch (error) {
          console.error("Failed to sync user:", error);
          // Fallback to just firebase user if sync fails
          setUser(user as any);
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })
    return () => unsubscribe()
  }, [setUser, setLoading])

  return (
    <>

      <Outlet />
      <Toaster />
    </>
  )
}

export default App
