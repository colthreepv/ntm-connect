import { useAuthStore } from '@/login/auth-store'
import { useShallow } from 'zustand/react/shallow'

export default function Navbar() {
  const { user, signout } = useAuthStore(
    useShallow(state => ({
      user: state.user,
      signout: state.signOut,
    })),
  )
  return (
    <header className="sticky inset-x-0 top-0 z-40 flex w-full flex-wrap border-b bg-white py-1 text-sm sm:flex-nowrap sm:justify-start sm:py-2 dark:border-gray-700 dark:bg-gray-800">
      <nav
        className="mx-auto flex w-full basis-full items-center px-4 sm:px-6 md:px-8"
        aria-label="Global"
      >
        <div className="me-5 lg:me-0">
          <a
            className="flex-none text-xl font-semibold dark:text-white"
            href="#"
            aria-label="Brand"
          >
            NTM
          </a>
        </div>

        <div className="ml-auto flex w-full items-center justify-end sm:order-3 sm:gap-x-3">
          <div className="flex flex-row items-center justify-end gap-2">
            <span className="mr-2 hidden text-gray-500 sm:inline-block dark:text-gray-400">
              {user?.email}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-slate-900 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              onClick={signout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
