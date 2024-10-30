'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from './login/auth-store'
import Navbar from './navbar'
import StoreTable, { SkeletonTable } from './store-table'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuthStore(state => ({ user: state.user, loading: state.loading }))

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  return (
    <div>
      <div id="app">
        <Navbar />
        <main className="container mx-auto">
          {loading && <SkeletonTable />}
          {user && <StoreTable />}
        </main>
      </div>
      <div id="modals" />
    </div>
  )
}
