import type { PropsWithChildren } from 'react'
import React from 'react'
import ReactModal from 'react-modal'
import { useModalStore } from '@/store/modal.store'

// ReactModal.setAppElement('#modals')

type ModalProps = PropsWithChildren<{
  title?: string
  submitText?: string
  submitEnabled?: boolean
  onSubmit?: () => void
}>

function emptyFunction() {}

function Modal({
  children,
  submitText = 'Submit',
  title,
  submitEnabled = true,
  onSubmit = emptyFunction,
}: ModalProps) {
  const { isOpen, closeModal } = useModalStore()
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="m-3 sm:mx-auto sm:w-full sm:max-w-lg"
      overlayClassName="fixed z-50 inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
    >
      <div className="pointer-events-auto flex flex-col rounded-xl border bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-neutral-700/70">
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-neutral-700">
          <h3 id="hs-basic-modal-label" className="font-bold text-gray-800 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600 dark:focus:bg-neutral-600"
            aria-label="Close"
            onClick={closeModal}
          >
            <span className="sr-only">Close</span>
            <svg
              className="size-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-4 text-gray-800 dark:text-neutral-400">{children}</div>
        <div className="flex items-center justify-end gap-x-2 border-t px-4 py-3 dark:border-neutral-700">
          <button
            type="button"
            className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            onClick={closeModal}
          >
            Close
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
            disabled={!submitEnabled}
            onClick={onSubmit}
          >
            {submitText}
          </button>
        </div>
      </div>
    </ReactModal>
  )
}

export default Modal
