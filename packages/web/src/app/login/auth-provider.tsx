'use client'

import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { createContext, useEffect, useMemo, useState } from 'react'
import { firebaseAuth } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
    } catch (error) {
      console.error('Error signing in:', error)
      setLoading(false)
      throw error
    }
  }

  const signOutUser = async () => {
    setLoading(true)
    try {
      await signOut(firebaseAuth)
    } catch (error) {
      console.error('Error signing out:', error)
      setLoading(false)
      throw error
    }
  }

  const authContextValue = useMemo(
    () => ({ user, loading, signIn, signOut: signOutUser }),
    [user, loading]
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
}
