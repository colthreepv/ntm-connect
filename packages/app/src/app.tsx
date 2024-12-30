import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import Navbar from './components/navbar.js'
import StoreTable from './components/store-table.js'
import { useAuthStore } from './login/auth-store.js'
import Login from './login/login.js'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { user, loading } = useAuthStore(state => ({
    user: state.user,
    loading: state.loading,
  }))

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  return user ? children : null
}

function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={(
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="container mx-auto">
                    <StoreTable />
                  </main>
                </>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </div>
      <div id="modals" />
    </BrowserRouter>
  )
}

export default App
