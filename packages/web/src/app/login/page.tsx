'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth } from './auth-context'
import { firebaseAuth } from './firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, loading } = useAuth()

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password)
    }
    catch (error) {
      console.error('Registration error:', error)
    }
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
    }
    catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth)
    }
    catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading)
    return <div>Loading...</div>

  return (
    <div>
      {user
        ? (
            <div>
              <p>
                Welcome,
                {user.email}
                !
              </p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )
        : (
            <form>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
              />
              <button onClick={handleRegister}>Register</button>
              <button onClick={handleLogin}>Login</button>
            </form>
          )}
    </div>
  )
}
