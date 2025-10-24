"use client"

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DialogProps } from '../../types/ui'

// Lightweight accessible modal that mimics shadcn-style Dialog behavior without Radix.
// Features: portal to body, overlay, Esc-to-close, click-outside-to-close, body scroll lock, basic focus restore.
export function Dialog({ open = false, onOpenChange, title, description, children }: DialogProps) {
  const lastActiveRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) {
      try { lastActiveRef.current = document.activeElement as HTMLElement } catch {}
      // lock body scroll
      try {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        ;(document.body as any).__dialog_prev_overflow = prev
      } catch {}
      // focus content after mount
      setTimeout(() => contentRef.current?.focus(), 0)
    } else {
      // restore body scroll
      try {
        const prev = (document.body as any).__dialog_prev_overflow
        if (prev !== undefined) document.body.style.overflow = prev
        else document.body.style.overflow = ''
      } catch {}
      // restore focus
      try { lastActiveRef.current?.focus() } catch {}
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange?.(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40"
        onMouseDown={(e) => {
          // clicking on backdrop closes
          if (e.target === e.currentTarget) onOpenChange?.(false)
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        tabIndex={-1}
        ref={contentRef}
        className="relative w-full max-w-md m-4 rounded-md bg-white p-4 shadow-lg outline-none"
      >
        {title ? <h3 id="dialog-title" className="text-lg font-semibold mb-2">{title}</h3> : null}
        {description ? <p id="dialog-description" className="text-sm text-gray-700 mb-4">{description}</p> : null}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  )
}
