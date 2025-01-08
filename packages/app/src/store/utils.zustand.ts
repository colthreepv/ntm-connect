import { type StateCreator, create } from 'zustand'
import { type DevtoolsOptions, devtools } from 'zustand/middleware'

export type GenericStoreCreator<T> = StateCreator<T, [], []>

export function createAuthStore<T>(
  storeCreator: GenericStoreCreator<T>,
  devtoolsOptions: DevtoolsOptions,
) {
  return create<T>()(
    devtools(storeCreator, devtoolsOptions),
  )
}
