import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
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
          await syncUser(user);
          console.log("User synced with backend");
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }

      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [setUser, setLoading])

  return (
    <>

      <Outlet />
    </>
  )
}

export default App
