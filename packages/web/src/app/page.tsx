'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from './login/auth-store'
import Navbar from './navbar'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuthStore((state) => ({ user: state.user, loading: state.loading }))

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div>
      <Navbar />
      <main className="container mx-auto">
        {loading && (
          <p
            className="h-4 rounded-full bg-gray-200 dark:bg-neutral-700"
            style={{ width: '40%' }}
          ></p>
        )}
        {user && (
          <p className="text-white">
            Welcome,
            {user.email}!
          </p>
        )}
      </main>
    </div>
  )
}
