import { type User, signOut as firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import type { FirebaseError } from 'firebase/app'
import { firebaseAuth } from './firebase'
import { createAuthStore } from '@/store/utils.zustand'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  userToken: () => Promise<string>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = createAuthStore<AuthStore>(
  set => ({
    user: null,
    loading: true,
    error: null,
    signIn: async (email, password) => {
      set({ loading: true, error: null })
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password)
      }
      catch (error) {
        set({ error: (error as FirebaseError).code, loading: false })
      }
    },
    signOut: async () => {
      set({ loading: true, error: null })
      try {
        await firebaseSignOut(firebaseAuth)
      }
      catch (error) {
        set({ error: (error as FirebaseError).code, loading: false })
      }
    },
    userToken: async () => {
      const user = firebaseAuth.currentUser
      if (!user) {
        throw new Error('No authenticated user')
      }
      return await user.getIdToken()
    },
  }),
  { name: 'auth-store', enabled: process.env.NODE_ENV === 'development' },
)

// Initialize the listener for auth state changes
onAuthStateChanged(firebaseAuth, (user) => {
  useAuthStore.setState({ user, loading: false })
})
