import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { NODE_ENV } from '@/config'

interface ModalState {
  isOpen: boolean
  onSubmit: (() => void) | null
  openModal: (onSubmit?: () => void) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>()(
  devtools(
    set => ({
      isOpen: false,
      onSubmit: null,
      openModal: (onSubmit?: () => void) => set({ isOpen: true, onSubmit }),
      closeModal: () => set({ isOpen: false, onSubmit: null }),
    }),
    { name: 'modal-store', enabled: NODE_ENV === 'development' },
  ),
)
