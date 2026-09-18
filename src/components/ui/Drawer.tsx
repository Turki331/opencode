import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { KeyboardEvent, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    if (!open) {
      return
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    panelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      if (previouslyFocusedRef.current?.isConnected) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [open])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab' || !panelRef.current) {
      return
    }

    const focusableElements = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    )

    if (focusableElements.length === 0) {
      event.preventDefault()
      panelRef.current.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement

    if (
      event.shiftKey &&
      (activeElement === panelRef.current || activeElement === firstElement)
    ) {
      event.preventDefault()
      lastElement?.focus()
    } else if (
      !event.shiftKey &&
      (activeElement === panelRef.current || activeElement === lastElement)
    ) {
      event.preventDefault()
      firstElement?.focus()
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <div
          aria-label={`${title} drawer backdrop`}
          className="drawer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose()
            }
          }}
          role="presentation"
        >
          <motion.aside
            ref={panelRef}
            aria-labelledby="drawer-title"
            aria-modal="true"
            className="drawer-panel"
            data-drawer-panel
            exit={prefersReducedMotion ? undefined : { x: '100%' }}
            initial={prefersReducedMotion ? false : { x: '100%' }}
            animate={prefersReducedMotion ? undefined : { x: 0 }}
            onKeyDown={handleKeyDown}
            role="dialog"
            tabIndex={-1}
            transition={{ duration: 0.2 }}
          >
            <header className="drawer-header">
              <h2 id="drawer-title">{title}</h2>
              <button
                aria-label="Close drawer"
                className="drawer-close"
                onClick={onClose}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </header>
            <div className="drawer-content">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
