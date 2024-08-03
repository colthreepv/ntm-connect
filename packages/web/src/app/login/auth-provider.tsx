'use client'

import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { createContext, useEffect, useMemo, useState } from 'react'
import { firebaseAuth } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const authContextValue = useMemo(() => ({ user, loading }), [user, loading])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}
