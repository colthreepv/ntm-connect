'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useRouter } from 'next/navigation'
import { useAuthStore } from './auth-store'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, loading, loginError, signIn } = useAuthStore(
    useShallow(state => ({
      user: state.user,
      loading: state.loading,
      loginError: state.error,
      signIn: state.signIn,
    })),
  )

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    await signIn(email, password)
  }

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  return (
    <div className="mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" id="app">
      <div className="mx-auto mt-7 max-w-md rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              {user ? 'Benvenuto' : 'Accedi'}
            </h1>
          </div>

          <div className="mt-5">
            <form onSubmit={handleLogin}>
              <div className="grid gap-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm dark:text-white">
                    Indirizzo email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm dark:text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  disabled={loading}
                >
                  {loading ? 'Controllo... 💽' : 'Accedi'}
                </button>

                {loginError && (
                  <div className="text-center">
                    <p className="mb-4 text-lg text-red-600 dark:text-red-400">
                      {loginError === 'auth/invalid-credential'
                        ? 'Credenziali non valide. Per favore riprova.'
                        : loginError}
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
