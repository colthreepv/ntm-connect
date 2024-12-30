import { create, type StateCreator } from 'zustand'
import { devtools, type DevtoolsOptions } from 'zustand/middleware'

export type GenericStoreCreator<T> = StateCreator<T, [], []>

export function createAuthStore<T>(
  storeCreator: GenericStoreCreator<T>,
  devtoolsOptions: DevtoolsOptions,
) {
  return create<T>()(
    devtools(storeCreator, devtoolsOptions),
  )
}
