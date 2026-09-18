import type { AnimationEvent } from 'react'

export interface ToastItem {
  id: string
  message: string
}

interface ToastProps {
  message: string
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === 'toast-lifetime') {
      onDismiss()
    }
  }

  return (
    <div
      aria-live="polite"
      className="toast"
      onAnimationEnd={handleAnimationEnd}
      role="status"
    >
      <span className="toast-message">{message}</span>
      <button
        aria-label="Dismiss notification"
        className="toast-dismiss"
        onClick={onDismiss}
        type="button"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  )
}

interface ToastHostProps {
  toasts: readonly ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastHost({ toasts, onDismiss }: ToastHostProps) {
  return (
    <div className="toast-host" aria-label="Notifications">
      {toasts.slice(-2).map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  )
}
