'use client'

import { useAuth } from './login/auth-context'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading)
    return <div>Loading...</div>

  return (
    <main>
      {user
        ? (
            <p>
              Welcome,
              {user.email}
              !
            </p>
          )
        : (
            <a href="/login">Please log in</a>
          )}
      {/* Rest of your component */}
    </main>
  )
}
